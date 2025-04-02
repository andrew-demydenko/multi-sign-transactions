import { ethers } from "ethers";
import MultiSigWalletArtifact from "@/multi-sign-wallet-artifact.json";
import { createWallet, deleteWallet } from "./wallet-service";
import { showGlobalToast } from "@/lib/toast";
import { IWallet, TProvider, TSigner } from "@/types";

const getContract = (
  contractAddress: string,
  provider: TSigner | TProvider
) => {
  return new ethers.Contract(
    contractAddress,
    MultiSigWalletArtifact.abi,
    provider
  );
};

interface ITransaction {
  txIndex: number;
  to: string;
  value: string;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isDestroy: boolean;
}

interface PendingTx {
  hash: string;
  type: "deploy" | "transfer" | "destroy";
  data: Partial<IWallet>;
}

const savePendingTx = (tx: PendingTx) => {
  const pendingTxs = JSON.parse(localStorage.getItem("pendingTxs") || "[]");
  pendingTxs.push(tx);
  localStorage.setItem("pendingTxs", JSON.stringify(pendingTxs));
};

const removePendingTx = (txHash: string) => {
  const pendingTxs = JSON.parse(localStorage.getItem("pendingTxs") || "[]");
  const updatedTxs = pendingTxs.filter((tx: PendingTx) => tx.hash !== txHash);
  localStorage.setItem("pendingTxs", JSON.stringify(updatedTxs));
};

export const processPendingTxs = async () => {
  const pendingTxs: PendingTx[] = JSON.parse(
    localStorage.getItem("pendingTxs") || "[]"
  );
  const provider = new ethers.BrowserProvider(window.ethereum);

  for (const tx of pendingTxs) {
    try {
      const receipt = await provider.waitForTransaction(tx.hash);

      if (receipt?.status === 1) {
        switch (tx.type) {
          case "deploy":
            const contractAddress = receipt.contractAddress;
            const owners = tx.data?.owners;
            const requiredSignatures = tx.data.requiredSignatures || 1;
            if (contractAddress && owners?.length && tx.data.network) {
              await createWallet({
                requiredSignatures,
                owners,
                walletAddress: contractAddress,
                network: tx.data.network,
              });
              showGlobalToast({
                type: "success",
                message: "Wallet is created successfully",
              });
            }

            break;
          case "destroy":
            if (receipt.contractAddress) {
              await deleteWallet({
                walletAddress: receipt.contractAddress,
              });
            }

            showGlobalToast({ type: "success", message: "Wallet is locked" });
            break;
        }
        removePendingTx(tx.hash);
      }
      if (receipt?.status === 0) {
        removePendingTx(tx.hash);
      }
    } catch (err) {
      console.error(`Transaction error ${tx.hash}:`, err);
    }
  }
};

interface IDeployWalletParams {
  owners: string[];
  requiredSignatures: number;
  provider: TProvider;
  signer: TSigner;
}

interface IDeployWalletResponse {
  contractAddress: string;
  receipt: ethers.TransactionReceipt | null;
  balance: number;
}

export const deployMultiSignWallet = async ({
  owners,
  requiredSignatures,
  signer,
  provider,
}: IDeployWalletParams): Promise<IDeployWalletResponse> => {
  try {
    if (!provider) {
      throw new Error("Signer is not available");
    }
    const network = await provider.getNetwork();
    const factory = new ethers.ContractFactory(
      MultiSigWalletArtifact.abi,
      MultiSigWalletArtifact.bytecode,
      signer
    );

    const contract = await factory.deploy(owners, requiredSignatures, {
      value: ethers.parseEther("0"),
    });
    const deploymentTransaction = contract.deploymentTransaction();

    if (deploymentTransaction?.hash) {
      savePendingTx({
        hash: deploymentTransaction.hash,
        type: "deploy",
        data: { owners, requiredSignatures, network: network.name },
      });
    }

    const receipt = (await deploymentTransaction?.wait()) || null;
    const contractAddress = await contract.getAddress();

    if (receipt?.status === 1) {
      await createWallet({
        walletAddress: contractAddress,
        owners,
        requiredSignatures,
        network: network.name,
      });
      showGlobalToast({
        type: "success",
        message: "Wallet is created successfully",
      });
    } else {
      showGlobalToast({
        type: "error",
        message: "Wallet creation failed",
      });
    }

    removePendingTx(deploymentTransaction?.hash || "");

    return { contractAddress, receipt, balance: 0 };
  } catch (error) {
    throw new Error(`Could not deploy wallet. ${error}`);
  }
};

export const getBalance = async ({
  contractAddress,
  provider,
}: {
  contractAddress: string;
  provider: TProvider;
}): Promise<string> => {
  try {
    const contract = getContract(contractAddress, provider);
    const balance = await contract.getBalance();
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error while getting balance", error);
    return "0";
  }
};

export const submitTransaction = async ({
  contractAddress,
  to,
  value,
  data,
  signer,
}: {
  contractAddress: string;
  to: string;
  value: string;
  data: string;
  signer: TSigner;
}): Promise<ethers.ContractTransaction> => {
  try {
    const contract = getContract(contractAddress, signer);
    return await contract.submitTransaction(
      to,
      ethers.parseEther(value),
      data || "0x"
    );
  } catch (error) {
    showGlobalToast({
      type: "error",
      message: "Creating failed or Insufficient contract balance",
    });
    throw new Error(`Could not create transaction. ${error}`);
  }
};

export const submitLockTransaction = async ({
  contractAddress,
  signer,
}: {
  contractAddress: string;
  signer: TSigner;
}): Promise<ethers.ContractTransaction> => {
  try {
    const contract = getContract(contractAddress, signer);
    return await contract.submitLockTrasaction();
  } catch (error) {
    showGlobalToast({
      type: "error",
      message: "Could not create lock transaction",
    });
    throw new Error(`Could not create lock transaction. ${error}`);
  }
};

export const confirmTransaction = async ({
  contractAddress,
  txIndex,
  signer,
}: {
  contractAddress: string;
  txIndex: number;
  signer: TSigner;
}): Promise<ethers.ContractTransaction> => {
  try {
    if (!signer) {
      throw new Error("Signer is not available");
    }

    const contract = getContract(contractAddress, signer);
    const userAddress = await signer.getAddress();
    const confirmed = await contract.hasConfirmed(txIndex, userAddress);

    if (confirmed) {
      showGlobalToast({
        type: "error",
        message: "Transaction is already confirmed",
      });
      return Promise.reject({ confirmed: true });
    }

    const result = await contract.confirmTransaction(txIndex);
    const receipt = await result.wait();

    if (receipt?.status === 0) {
      showGlobalToast({
        type: "error",
        message: "Transaction is failed",
      });
      throw new Error(`Could not confirm transaction.`);
    } else {
      showGlobalToast({ type: "success", message: "Transaction is confirmed" });
      return result;
    }
  } catch (error) {
    showGlobalToast({
      type: "error",
      message: "Could not confirm transaction",
    });
    throw new Error(`Could not confirm transaction. ${error}`);
  }
};

export const getTransactions = async ({
  contractAddress,
  provider,
}: {
  contractAddress: string;
  provider: TProvider;
}): Promise<ITransaction[]> => {
  const contract = getContract(contractAddress, provider);
  try {
    return await contract.getTransactionCount().then(async (count: number) => {
      const transactions = [];
      for (let i = 0; i < count; i++) {
        const tx = await contract.getTransaction(i);
        transactions.push({
          txIndex: i,
          to: tx[0],
          value: ethers.formatEther(tx[1]),
          data: tx[2],
          executed: tx[3],
          numConfirmations: tx[4],
          isDestroy: tx[5],
        });
      }
      return transactions;
    });
  } catch (error) {
    console.error("Error while getting transactions", error);
  }
  return [];
};

export const getTransaction = async ({
  contractAddress,
  txIndex,
  provider,
}: {
  contractAddress: string;
  txIndex: number;
  provider: TProvider;
}): Promise<ITransaction> => {
  try {
    const contract = getContract(contractAddress, provider);
    const tx = await contract.getTransaction(txIndex);
    return {
      txIndex,
      to: tx[0],
      value: ethers.formatEther(tx[1]),
      data: tx[2],
      executed: tx[3],
      numConfirmations: tx[4],
      isDestroy: tx[5],
    };
  } catch (error) {
    throw new Error(`Could not fetch transaction. ${error}`);
  }
};
