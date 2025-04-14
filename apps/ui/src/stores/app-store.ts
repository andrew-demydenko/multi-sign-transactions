import { create } from "zustand";
import { IUser } from "@/types";
import { IMetaMaskSession } from "@/services/metamask-service";

interface IAppStore extends IMetaMaskSession, IUser {
  userName?: string;
  balance: string;
  setData: (data: IMetaMaskSession) => void;
  setUserData: (data: IUser) => void;
  setBalance: (balance: string) => void;
  setProviders: (providers: {
    infuraProvider: IMetaMaskSession["infuraProvider"];
    provider: IMetaMaskSession["provider"];
  }) => void;
  setNetwork: (network: { network: string }) => void;
  setUserName: (userName: string) => void;
}

const useAppStore = create<IAppStore>((set) => ({
  balance: "",
  userName: "",
  userAddress: "",
  network: "",
  signer: null,
  provider: null,
  infuraProvider: null,
  setData: (data) => set(data),
  setUserName: (userName) => set({ userName }),
  setUserData: ({ userAddress, name }) => set({ userAddress, userName: name }),
  setBalance: (balance) => set({ balance }),
  setProviders: ({ infuraProvider, provider }) =>
    set({ infuraProvider, provider }),
  setNetwork: ({ network }) => set({ network }),
}));

export { useAppStore };
