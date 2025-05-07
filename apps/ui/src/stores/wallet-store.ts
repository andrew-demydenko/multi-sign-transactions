import { create } from "zustand";

export interface IWalletStore {
  owners: string[];
  requiredSignatures: number;
  formSubmitted: boolean;
  newOwner: string;
  addOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
  setRequiredSignatures: (num: number) => void;
  setNewOwner: (newOwner: string) => void;
  setFormSubmitted: (formSubmitted: boolean) => void;
  reset: () => void;
}

const initialState = {
  owners: <IWalletStore["owners"]>[],
  newOwner: "",
  formSubmitted: false,
  requiredSignatures: 1,
};

const useWalletStore = create<IWalletStore>((set) => ({
  ...initialState,
  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  removeOwner: (owner) =>
    set((state) => ({ owners: state.owners.filter((o) => o !== owner) })),
  setRequiredSignatures: (num) => set({ requiredSignatures: num }),
  setNewOwner: (owner) => set({ newOwner: owner }),
  setFormSubmitted: (formSubmitted) => set({ formSubmitted }),
  reset: () => set(initialState),
}));

export { useWalletStore };
