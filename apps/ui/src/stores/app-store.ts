import { create } from "zustand";
import { IUser } from "@/types";
import { IAccountSession } from "@/services/account-service";

interface IAppStore extends IAccountSession, IUser {
  userName?: string;
  balance: string;
  setData: (data: IAccountSession) => void;
  setUserData: (data: IUser) => void;
  setBalance: (balance: string) => void;
  setProviders: (providers: {
    infuraProvider: IAccountSession["infuraProvider"];
    provider: IAccountSession["provider"];
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
