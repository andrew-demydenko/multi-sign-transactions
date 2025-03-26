import { ethers } from "ethers";
import MultiSigWalletArtifact from "@/multi-sign-wallet-artifact.json";

const getContract = (
  contractAddress: string,
  provider: ethers.Signer | ethers.JsonRpcProvider
) => {
  return new ethers.Contract(
    contractAddress,
    MultiSigWalletArtifact.abi,
    provider
  );
};

interface ITransaction {
  to: string;
  value: string;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isDestroy: boolean;
}

export interface IWallet {
  owners: string[];
  requiredSignatures: number;
  transactions?: ITransaction[];
  walletAddress: string;
}

export const fetchWallet = async (walletAddress: string): Promise<IWallet> => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/api/wallets/${walletAddress}`
  );
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};

export const fetchUserWallets = async (
  userAddress: string
): Promise<IWallet[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/api/wallets/user/${userAddress}`
  );
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};

export const createWallet = async ({
  walletAddress,
  owners,
  requiredSignatures,
}: IWallet): Promise<IWallet> => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/api/wallets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress, owners, requiredSignatures }),
    }
  );
  if (!response.ok) throw new Error("Failed to create wallet");
  return response.json();
};

interface IDeployWalletParams {
  owners: string[];
  requiredSignatures: number;
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
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
  const network = await provider.getNetwork();
  const requiredNetwork = import.meta.env.VITE_NETWORK;

  if (network.name !== requiredNetwork) {
    throw new Error(`Change network on (${requiredNetwork})`);
  }

  const factory = new ethers.ContractFactory(
    MultiSigWalletArtifact.abi,
    MultiSigWalletArtifact.bytecode,
    signer
  );

  const contract = await factory.deploy(owners, requiredSignatures, {
    value: ethers.parseEther("0"),
  });
  const deploymentTransaction = contract.deploymentTransaction();
  const receipt = (await deploymentTransaction?.wait()) || null;
  const contractAddress = await contract.getAddress();

  return { contractAddress, receipt, balance: 0 };
};

export const getBalance = async ({
  contractAddress,
  provider,
}: {
  contractAddress: string;
  provider: ethers.BrowserProvider;
}): Promise<string> => {
  const balance = await provider.getBalance(contractAddress);
  return ethers.formatEther(balance);
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
  signer: ethers.Signer;
}): Promise<ethers.ContractTransaction> => {
  const contract = getContract(contractAddress, signer);
  return await contract.submitTransaction(to, ethers.parseEther(value), data);
};

export const submitLockTransaction = async ({
  contractAddress,
  signer,
}: {
  contractAddress: string;
  signer: ethers.Signer;
}): Promise<ethers.ContractTransaction> => {
  const contract = getContract(contractAddress, signer);
  return await contract.submitLockTrasaction();
};

export const confirmTransaction = async ({
  contractAddress,
  txIndex,
  signer,
}: {
  contractAddress: string;
  txIndex: number;
  signer: ethers.Signer;
}): Promise<ethers.ContractTransaction> => {
  const contract = getContract(contractAddress, signer);
  return await contract.confirmTransaction(txIndex);
};

export const getTransactions = async ({
  contractAddress,
  provider,
}: {
  contractAddress: string;
  provider: ethers.JsonRpcProvider;
}): Promise<ITransaction[]> => {
  const contract = getContract(contractAddress, provider);
  return await contract.getTransactionCount().then(async (count: number) => {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      const tx = await contract.getTransaction(i);
      transactions.push({
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
};

export const getTransaction = async ({
  contractAddress,
  txIndex,
  provider,
}: {
  contractAddress: string;
  txIndex: number;
  provider: ethers.JsonRpcProvider;
}): Promise<ITransaction> => {
  const contract = getContract(contractAddress, provider);
  const tx = await contract.getTransaction(txIndex);
  return {
    to: tx[0],
    value: ethers.formatEther(tx[1]),
    data: tx[2],
    executed: tx[3],
    numConfirmations: tx[4],
    isDestroy: tx[5],
  };
};
