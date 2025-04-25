import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitTransaction } from "@/services/provider-service";
import { useAppStore } from "@/stores/app-store";
import { clsx } from "clsx";
import { useReducer, useEffect } from "react";
import { useCheckAccountUnlock } from "@/hooks/account-hooks";

interface TransactionCreationModalProps {
  walletAddress: string | null;
  onClose: () => void;
  onTransactionCreated?: () => void;
}

interface FormState {
  toAddress: string;
  amount: string;
  transactionData: string;
  submitted: boolean;
}
type FormAction =
  | { type: "SET_TO_ADDRESS"; value: string }
  | { type: "SET_AMOUNT"; value: string }
  | { type: "SET_TRANSACTION_DATA"; value: string }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "RESET" };

const initialState: FormState = {
  toAddress: "",
  amount: "",
  transactionData: "",
  submitted: false,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_TO_ADDRESS":
      return { ...state, toAddress: action.value };
    case "SET_AMOUNT":
      return { ...state, amount: action.value };
    case "SET_TRANSACTION_DATA":
      return { ...state, transactionData: action.value };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const validateForm = ({
  toAddress,
  amount,
}: {
  toAddress: string;
  amount: string;
}) => {
  const errors: Record<string, string> = {};

  if (!toAddress.trim()) {
    errors.toAddress = "Recipient address is required";
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
    errors.toAddress = "Invalid Ethereum address";
  }

  if (!amount.trim()) {
    errors.amount = "Amount is required";
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

const TransactionCreationModal = ({
  walletAddress,
  onClose,
  onTransactionCreated,
}: TransactionCreationModalProps) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { toAddress, amount, transactionData, submitted } = state;
  const { isUnlockedAccount, checkIsUnlockedAccount } = useCheckAccountUnlock();
  const signer = useAppStore((state) => state.signer);
  const queryClient = useQueryClient();

  const validation = validateForm({ toAddress, amount });

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!signer || !walletAddress) throw new Error("Signer not connected");
      return submitTransaction({
        contractAddress: walletAddress,
        to: toAddress,
        value: amount,
        data: transactionData,
        signer,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", walletAddress],
      });
      onTransactionCreated?.();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_SUBMITTED", value: true });

    if (validation) return;

    mutate();
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    if (walletAddress) {
      checkIsUnlockedAccount();
    }
  }, [walletAddress, checkIsUnlockedAccount]);

  return (
    <div className={clsx("modal", { "modal-open": !!walletAddress })}>
      <div className="modal-box max-w-md">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4">Create New Transaction</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">Recipient Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={toAddress}
              onChange={(e) =>
                dispatch({ type: "SET_TO_ADDRESS", value: e.target.value })
              }
            />
            {submitted && validation?.toAddress && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validation.toAddress}
                </span>
              </label>
            )}
          </div>

          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">Amount (ETH)</span>
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.1"
              className="input input-bordered w-full"
              value={amount}
              onChange={(e) =>
                dispatch({ type: "SET_AMOUNT", value: e.target.value })
              }
            />
            {submitted && validation?.amount && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {validation.amount}
                </span>
              </label>
            )}
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Transaction Data (Optional)</span>
            </label>
            <textarea
              placeholder="0x..."
              className="textarea textarea-bordered h-24 w-full"
              value={transactionData}
              onChange={(e) =>
                dispatch({
                  type: "SET_TRANSACTION_DATA",
                  value: e.target.value,
                })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                !isUnlockedAccount || isPending || (submitted && !!validation)
              }
            >
              {isPending ? "Creating..." : "Create Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionCreationModal;
