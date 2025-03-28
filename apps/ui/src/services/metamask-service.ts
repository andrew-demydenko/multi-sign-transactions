import { ethers } from "ethers";
import { TProvider, TSigner, TInfuraProvider } from "@/types";

export interface IMetaMaskSession {
  provider: TProvider;
  signer: TSigner;
  network: string;
  userAddress: string;
  infuraProvider: TInfuraProvider;
}

export const restoreMetamaskSession =
  async (): Promise<IMetaMaskSession | null> => {
    const isConnected = localStorage.getItem("isConnected");
    if (window.ethereum && isConnected === "true") {
      const userAddress = localStorage.getItem("userAddress");
      const network = localStorage.getItem("network");

      if (userAddress && network) {
        console.log("Connection restored:", network, userAddress);

        const infuraProvider = createInfuraProvider();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const currentAddress = await signer.getAddress();
        if (currentAddress.toLowerCase() !== userAddress.toLowerCase()) {
          localStorage.removeItem("isConnected");
          return null;
        }

        return { provider, signer, userAddress, network, infuraProvider };
      }
    }
    return null;
  };

export const connectMetaMask = async (): Promise<IMetaMaskSession> => {
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
  const savedNetwork =
    localStorage.getItem("network") || import.meta.env.VITE_NETWORK;
  return new ethers.InfuraProvider(
    savedNetwork,
    import.meta.env.VITE_INFURA_API_KEY
  );
};

export const disconnectMetaMask = () => {
  localStorage.removeItem("isConnected");
  localStorage.removeItem("userAddress");
  localStorage.removeItem("network");

  window.location.reload();
};
