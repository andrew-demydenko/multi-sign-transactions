import { ethers } from "ethers";

export const restoreMetamaskSession = async () => {
  const isConnected = localStorage.getItem("isConnected");
  if (isConnected === "true") {
    const userAddress = localStorage.getItem("userAddress");
    const network = localStorage.getItem("network");

    if (userAddress && network) {
      console.log("Connection restored:", network, network);

      const infuraProvider = createInfuraProvider();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return { provider, signer, userAddress, network, infuraProvider };
    }
  }
  return null;
};

export const connectMetaMask = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const infuraProvider = createInfuraProvider();
    const accounts = await window.ethereum.request(
      { method: "eth_requestAccounts" },
      []
    );

    if (!accounts.length) {
      throw new Error("No accounts found");
    }
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const network = await provider.getNetwork();

    localStorage.setItem("userAddress", userAddress);
    localStorage.setItem("network", network.name);
    localStorage.setItem("isConnected", "true");

    return {
      provider,
      signer,
      userAddress,
      network: network.name,
      infuraProvider,
    };
  } else {
    console.error("MetaMask is not installed.");
  }
};

export const createInfuraProvider = () => {
  const savedNetwork = localStorage.getItem("network") || "sepolia";

  const provider = new ethers.InfuraProvider(
    savedNetwork,
    import.meta.env.VITE_INFURA_API_KEY
  );
  return provider;
};

export async function signTransaction(
  signer: ethers.Signer,
  to: string,
  amount: ethers.BigNumberish
) {
  const tx = await signer.sendTransaction({
    to,
    value: amount,
  });
  try {
    const result = await tx.wait();
    console.log(result);
  } catch (error) {
    console.error(`Transaction failed: ${error}`);
  }

  console.log("Transaction successful:", tx);
}
