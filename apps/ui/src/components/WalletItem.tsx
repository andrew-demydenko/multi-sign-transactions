import { memo } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { IWalletResponse } from "@/types";
import { useToast } from "@/providers/toast-provider";
import LockWalletButton from "./LockWalletButton";

interface WalletItemProps {
  wallet: IWalletResponse;
  showTransactions: (arg0: string) => void;
  showTransactionCreation: (arg0: string) => void;
}

const WalletItem = memo(
  ({ wallet, showTransactions, showTransactionCreation }: WalletItemProps) => {
    const { showToast } = useToast();
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast({ message: "Address copied to clipboard", type: "success" });
    };

    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <h3 className="card-title truncate">
              {wallet.walletAddress.slice(0, 10)}
            </h3>
            <button
              onClick={() => copyToClipboard(wallet.walletAddress)}
              className="btn btn-ghost btn-xs"
              title="Copy address"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="text-sm space-y-2 mt-2">
            <div>
              <span className="font-medium">Owners:</span>
              <ul className="list-disc list-inside">
                {wallet.owners.map((owner) => (
                  <li key={owner.userAddress} className="truncate">
                    {owner.name ? `${owner.name} -` : ""} {owner.userAddress}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-medium">Required signatures:</span>
              <span> {wallet.requiredSignatures}</span>
            </div>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              onClick={() => showTransactions(wallet.walletAddress)}
              className="btn btn-sm btn-primary"
            >
              View Transactions
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => showTransactionCreation(wallet.walletAddress)}
            >
              Create Transaction
            </button>
            <LockWalletButton
              walletAddress={wallet.walletAddress}
              requiredSignatures={wallet.requiredSignatures}
            />
          </div>
        </div>
      </div>
    );
  }
);

WalletItem.displayName = "WalletItem";

export default WalletItem;
