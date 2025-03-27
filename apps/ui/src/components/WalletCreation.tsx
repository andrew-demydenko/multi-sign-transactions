import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createWallet } from "@/services/provider-service";
import { deployMultiSignWallet } from "@/services/provider-service";
import { useAppStore } from "@/stores/app-store";
import { useWalletStore, IWalletStore } from "@/stores/wallet-store";
import { TrashIcon } from "@heroicons/react/20/solid";

const getDialogElement = () =>
  document.getElementById("wallet-creation") as HTMLDialogElement;

const validateForm = ({
  owners,
  requiredSignatures,
}: Pick<IWalletStore, "owners" | "requiredSignatures">) => {
  const errors: Record<string, string> = {};
  if (!owners.length) {
    errors["owners"] = "Owners cannot be empty";
  }
  if (requiredSignatures === 0 || requiredSignatures > owners.length) {
    errors["requiredSignatures"] = "Invalid required signatures";
  }
  return Object.keys(errors).length === 0 ? null : errors;
};

const MultiSignWalletCreation = () => {
  const [newOwner, setNewOwner] = useState<string>("");
  const [submited, setSubmited] = useState<boolean>(false);
  const signer = useAppStore((state) => state.signer || null);
  const provider = useAppStore((state) => state.provider);
  const {
    owners,
    addOwner,
    removeOwner,
    setRequiredSignatures,
    requiredSignatures,
  } = useWalletStore();
  const validation = validateForm({ owners, requiredSignatures });

  const { mutate: saveWallet, isPending } = useMutation({
    mutationFn: async (
      params: Pick<IWalletStore, "owners" | "requiredSignatures">
    ) => {
      try {
        if (signer && provider) {
          const { contractAddress, receipt, balance } =
            await deployMultiSignWallet({
              owners,
              requiredSignatures,
              signer,
              provider,
            });
          console.log(contractAddress, receipt, balance);
          await createWallet({ ...params, walletAddress: contractAddress });
        }
      } catch (error) {
        console.error(`Error creating wallet: ${error}`);
      }

      getDialogElement().close();
    },
  });

  return (
    <>
      <dialog id="wallet-creation" className="modal">
        <div className="modal-box text-left text-black">
          <h2 className="text-xl font-semibold mb-5 text-center">
            Create Multi-Sign Wallet
          </h2>
          <div className="join mb-3 w-[100%]">
            <label className="input w-100 join-item">
              <input
                required
                placeholder="Owner Address"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
              />
            </label>
            <button
              className="btn btn-success text-xs text-white join-item"
              onClick={() => {
                if (newOwner.trim()) {
                  addOwner(newOwner.trim());
                  setNewOwner("");
                }
              }}
            >
              Add Owner
            </button>
          </div>
          <div className="text-xs text-error mb-2">
            {submited && validation?.owners}
          </div>
          <ul className="max-h-[400px] overflow-auto list mb-2 bg-base-100 rounded-box shadow-md">
            {owners.map((owner, index) => (
              <li className="list-row py-2" key={owner}>
                <div className="list-col-grow flex items-center">
                  <span className="mr-2">{index + 1}.</span>
                  {owner}
                </div>
                <button
                  className="btn btn-error text-xs p-0 size-8"
                  onClick={() => removeOwner(owner)}
                >
                  <TrashIcon className="text-white" width={16} height={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mb-2 join">
            <label className="label mr-3">Required Signatures</label>
            <input
              className="input"
              type="number"
              min={1}
              max={owners.length || 1}
              value={requiredSignatures}
              onChange={(e) => setRequiredSignatures(Number(e.target.value))}
            />
          </div>
          <div className="text-xs text-error mb-2">
            {submited && validation?.requiredSignatures}
          </div>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              disabled={isPending || (submited && !!validation)}
              onClick={() => {
                setSubmited(true);
                console.log(validation);
                if (validation) return;
                saveWallet({
                  owners,
                  requiredSignatures,
                });
              }}
            >
              {isPending ? "Saving Wallet" : "Create Wallet"}
            </button>
            <button onClick={() => getDialogElement().close()} className="btn">
              Close
            </button>
          </div>
        </div>
      </dialog>
      <button
        onClick={() => getDialogElement().showModal()}
        className="btn btn-primary"
      >
        Create Wallet
      </button>
    </>
  );
};

export default MultiSignWalletCreation;
