import { create } from "zustand";

export interface IWalletStore {
  owners: string[];
  requiredSignatures: number;
  addOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
  setRequiredSignatures: (num: number) => void;
}

const initialState: Partial<IWalletStore> = {
  owners: [],
  requiredSignatures: 1,
};

const useWalletStore = create<IWalletStore>((set) => ({
  ...initialState,
  owners: [],
  requiredSignatures: 1,
  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  removeOwner: (owner) =>
    set((state) => ({ owners: state.owners.filter((o) => o !== owner) })),
  setRequiredSignatures: (num) => set({ requiredSignatures: num }),
  reset: () => set(initialState),
}));

export { useWalletStore };
