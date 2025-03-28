import { useReducer } from "react";
import { useMutation } from "@tanstack/react-query";
import { deployMultiSignWallet } from "@/services/provider-service";
import { useAppStore } from "@/stores/app-store";
import { useWalletStore } from "@/stores/wallet-store";
import { TrashIcon } from "@heroicons/react/20/solid";
import { useQueryClient } from "@tanstack/react-query";
import { TSigner, TProvider } from "@/types";

interface IWalletCreationParams {
  owners: string[];
  requiredSignatures: number;
  signer: TSigner;
  provider: TProvider;
  userAddress: string;
}

type FormState = {
  newOwner: string;
  submitted: boolean;
};

type FormAction =
  | { type: "SET_NEW_OWNER"; value: string }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "RESET" };

const initialState: FormState = {
  newOwner: "",
  submitted: false,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_NEW_OWNER":
      return { ...state, newOwner: action.value };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const getDialogElement = () =>
  document.getElementById("wallet-creation") as HTMLDialogElement;

const validateForm = ({
  owners,
  requiredSignatures,
}: {
  owners: string[];
  requiredSignatures: number;
}) => {
  const errors: Record<string, string> = {};
  if (!owners.length) {
    errors.owners = "Owners cannot be empty";
  }
  if (requiredSignatures === 0 || requiredSignatures > owners.length) {
    errors.requiredSignatures = "Invalid required signatures";
  }
  return Object.keys(errors).length === 0 ? null : errors;
};

const WalletCreation = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { newOwner, submitted } = state;
  const { signer, provider, userAddress } = useAppStore();
  const {
    owners,
    addOwner,
    removeOwner,
    setRequiredSignatures,
    requiredSignatures,
  } = useWalletStore();
  const queryClient = useQueryClient();

  const validation = validateForm({ owners, requiredSignatures });

  const { mutate: saveWallet, isPending } = useMutation({
    mutationFn: async (params: IWalletCreationParams) => {
      try {
        if (params.signer && params.provider) {
          const { contractAddress } = await deployMultiSignWallet(params);
          queryClient.invalidateQueries({
            queryKey: ["wallets", params.userAddress],
            exact: true,
          });
          return contractAddress;
        }
      } catch (error) {
        console.error("Error creating wallet:", error);
        throw error;
      }
    },
    onSuccess: () => {
      handleClose();
    },
  });

  const handleAddOwner = () => {
    if (newOwner.trim()) {
      addOwner(newOwner.trim());
      dispatch({ type: "SET_NEW_OWNER", value: "" });
    }
  };

  const handleSubmit = () => {
    dispatch({ type: "SET_SUBMITTED", value: true });
    if (validation) return;

    saveWallet({
      owners,
      requiredSignatures,
      signer,
      provider,
      userAddress,
    });
  };

  const handleClose = () => {
    dispatch({ type: "RESET" });
    getDialogElement().close();
  };

  return (
    <>
      <dialog id="wallet-creation" className="modal">
        <div className="modal-box text-left text-black">
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-5 text-center">
            Create Multi-Sign Wallet
          </h2>

          <div className="join mb-3 w-full">
            <input
              type="text"
              placeholder="Owner Address"
              className="input input-bordered join-item w-full"
              value={newOwner}
              onChange={(e) =>
                dispatch({ type: "SET_NEW_OWNER", value: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleAddOwner()}
            />
            <button
              type="button"
              className="btn btn-success text-xs text-white join-item"
              onClick={handleAddOwner}
            >
              Add Owner
            </button>
          </div>

          {submitted && validation?.owners && (
            <div className="text-xs text-error mb-2">{validation.owners}</div>
          )}

          <ul className="max-h-[400px] overflow-auto mb-2 bg-base-100 rounded-box shadow-md">
            {owners.map((owner, index) => (
              <li
                key={owner}
                className="flex justify-between items-center py-2 px-4"
              >
                <div className="flex items-center">
                  <span className="mr-2">{index + 1}.</span>
                  <span className="font-mono">{owner}</span>
                </div>
                <button
                  className="btn btn-error btn-xs p-0 size-6"
                  onClick={() => removeOwner(owner)}
                  aria-label="Remove owner"
                >
                  <TrashIcon className="size-3" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 mb-2">
            <label className="label">Required Signatures</label>
            <input
              type="number"
              className="input input-bordered"
              min={1}
              max={owners.length || 1}
              value={requiredSignatures}
              onChange={(e) => setRequiredSignatures(Number(e.target.value))}
            />
          </div>

          {submitted && validation?.requiredSignatures && (
            <div className="text-xs text-error mb-2">
              {validation.requiredSignatures}
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={handleClose}
              disabled={isPending}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isPending || (submitted && !!validation)}
              onClick={handleSubmit}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Wallet"
              )}
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

export default WalletCreation;
