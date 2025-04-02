import { ethers } from "ethers";

export type Nullable<T> = T | null;

export interface IUser {
  userAddress: string;
  name?: string;
}

export interface IWallet {
  owners: string[];
  requiredSignatures: number;
  walletAddress: string;
  network: string;
}

export interface IWalletResponse extends Omit<IWallet, "owners"> {
  owners: IUser[];
}

export type TSigner = Nullable<ethers.Signer>;
export type TProvider = Nullable<ethers.BrowserProvider>;
export type TInfuraProvider = Nullable<ethers.InfuraProvider>;
