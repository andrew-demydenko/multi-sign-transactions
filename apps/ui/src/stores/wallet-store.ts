import { create } from "zustand";
import { ITransaction } from "@/services/transaction-service";

interface IWalletStore {
  owners: string[];
  requiredSignatures: number;
  transactions: ITransaction[];
  setTransactions: (transactions: ITransaction[]) => void;
  addOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
  setRequiredSignatures: (num: number) => void;
}

const useWalletStore = create<IWalletStore>((set) => ({
  owners: [],
  requiredSignatures: 1,
  transactions: [],
  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  removeOwner: (owner) =>
    set((state) => ({ owners: state.owners.filter((o) => o !== owner) })),
  setRequiredSignatures: (num) => set({ requiredSignatures: num }),

  setTransactions: (transactions: ITransaction[]) => set({ transactions }),
}));

export { useWalletStore };

// ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC"]

// "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", 10000000000000000, []
