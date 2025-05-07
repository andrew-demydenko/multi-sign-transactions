import { ethers } from "ethers";
import { TProvider, TSigner, TInfuraProvider } from "@/types";

export interface IAccountSession {
  provider: TProvider;
  signer: TSigner;
  network: string;
  userAddress: string;
  infuraProvider: TInfuraProvider;
}

const getSigner = async (
  provider: TProvider,
  timeoutMs: number
): Promise<TSigner> => {
  try {
    const result = await Promise.race([
      provider?.getSigner(),
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return result as TSigner;
  } catch (error) {
    console.error("Error getting signer:", error);
    return null;
  }
};

const clearLocalStorage = () => {
  localStorage.removeItem("isConnected");
  localStorage.removeItem("userAddress");
  localStorage.removeItem("network");
};

export const restoreConnection = async (): Promise<IAccountSession | null> => {
  const isConnected = localStorage.getItem("isConnected");
  const userAddress = localStorage.getItem("userAddress");
  const network = localStorage.getItem("network");

  if (!window.ethereum || isConnected !== "true" || !userAddress || !network) {
    clearLocalStorage();
    return null;
  }

  const infuraProvider = createInfuraProvider();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await getSigner(provider, 2000);
  if (!signer) {
    clearLocalStorage();
    return null;
  }

  const currentAddress = await signer.getAddress();
  if (currentAddress.toLowerCase() !== userAddress.toLowerCase()) {
    clearLocalStorage();
    return null;
  }

  console.info("Connection restored:", network, userAddress);
  return { provider, signer, userAddress, network, infuraProvider };
};

export const connectAccount = async (): Promise<IAccountSession> => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const infuraProvider = createInfuraProvider();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

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
    throw new Error("MetaMask is not installed");
  }
};

export const createInfuraProvider = (): ethers.InfuraProvider => {
  const savedNetwork = localStorage.getItem("network") || "sepolia";
  return new ethers.InfuraProvider(
    savedNetwork,
    import.meta.env.VITE_INFURA_API_KEY
  );
};

export const disconnectAccount = () => {
  clearLocalStorage();

  window.location.reload();
};
