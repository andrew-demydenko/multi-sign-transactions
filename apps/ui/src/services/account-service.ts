import { ethers } from "ethers";
import { TProvider, TSigner, TInfuraProvider } from "@/types";

export interface IAccountSession {
  provider: TProvider;
  signer: TSigner;
  network: string;
  userAddress: string;
  infuraProvider: TInfuraProvider;
}

export const restoreConnection = async (): Promise<IAccountSession | null> => {
  const isConnected = localStorage.getItem("isConnected");
  if (window.ethereum && isConnected === "true") {
    const userAddress = localStorage.getItem("userAddress");
    const network = localStorage.getItem("network");

    if (userAddress && network) {
      console.info("Connection restored:", network, userAddress);

      const infuraProvider = createInfuraProvider();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const currentAddress = await signer.getAddress();

      if (currentAddress.toLowerCase() !== userAddress.toLowerCase()) {
        localStorage.removeItem("isConnected");
        localStorage.removeItem("userAddress");
        localStorage.removeItem("network");
        return null;
      }

      return { provider, signer, userAddress, network, infuraProvider };
    }
  }
  return null;
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
  localStorage.removeItem("isConnected");
  localStorage.removeItem("userAddress");
  localStorage.removeItem("network");

  window.location.reload();
};
