import { create } from "zustand";
import { IUser } from "@/types";
import { IMetaMaskSession } from "@/services/metamask-service";

interface IAppStore extends IMetaMaskSession, IUser {
  balance: string;
  setData: (data: IMetaMaskSession) => void;
  setUserData: (data: IUser) => void;
  setBalance: (balance: string) => void;
  setProviders: (providers: {
    infuraProvider: IMetaMaskSession["infuraProvider"];
    provider: IMetaMaskSession["provider"];
  }) => void;
  setNetwork: (network: { network: string }) => void;
}

const useAppStore = create<IAppStore>((set) => ({
  balance: "",
  userAddress: "",
  network: "",
  signer: null,
  provider: null,
  infuraProvider: null,
  setData: (data) => set(data),
  setUserData: ({ userAddress, name }) => set({ userAddress, name }),
  setBalance: (balance) => set({ balance }),
  setProviders: ({ infuraProvider, provider }) =>
    set({ infuraProvider, provider }),
  setNetwork: ({ network }) => set({ network }),
}));

export { useAppStore };
