import { create } from "zustand";
import { ITransaction } from "@/services/transaction-service";

export interface IWalletStore {
  owners: string[];
  requiredSignatures: number;
  transactions: ITransaction[];
  setTransactions: (transactions: ITransaction[]) => void;
  addOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
  setRequiredSignatures: (num: number) => void;
}

const initialState: Partial<IWalletStore> = {
  owners: [],
  requiredSignatures: 1,
  transactions: [],
};

const useWalletStore = create<IWalletStore>((set) => ({
  ...initialState,
  owners: [],
  requiredSignatures: 1,
  transactions: [],
  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  removeOwner: (owner) =>
    set((state) => ({ owners: state.owners.filter((o) => o !== owner) })),
  setRequiredSignatures: (num) => set({ requiredSignatures: num }),

  setTransactions: (transactions: ITransaction[]) => set({ transactions }),
  reset: () => set(initialState),
}));

export { useWalletStore };
