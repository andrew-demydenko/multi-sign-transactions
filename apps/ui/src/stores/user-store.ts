import { create } from "zustand";
import { ethers } from "ethers";
import { IUser } from "@/services/user-service";

type Nullable<T> = T | null;

export interface IProviderData {
  provider: Nullable<ethers.Provider>;
  signer: Nullable<ethers.JsonRpcSigner>;
  network: string;
  userAddress: string;
  infuraProvider: Nullable<ethers.Provider>;
}

interface IUserStore extends IProviderData, IUser {
  balance: string;
  setData: (data: IProviderData) => void;
  setUserData: (data: IUser) => void;
  setBalance: (balance: string) => void;
}

const useUserStore = create<IUserStore>((set) => ({
  balance: "",
  userAddress: "",
  network: "",
  signer: null,
  provider: null,
  infuraProvider: null,
  setData: (data) => set(data),
  setUserData: ({ userAddress, name }) => set({ userAddress, name }),
  setBalance: (balance) => set({ balance }),
}));

export { useUserStore };
