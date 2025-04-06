import { useState, memo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { submitLockTransaction } from "@/services/provider-service";
import { useAppStore } from "@/stores/app-store";
import ConfirmationModal from "./ConfirmationModal";

interface LockWalletButtonProps {
  walletAddress: string;
  requiredSignatures: number;
  onSuccess?: () => void;
}

const LockWalletButton = memo(
  ({ walletAddress, requiredSignatures, onSuccess }: LockWalletButtonProps) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const queryClient = useQueryClient();
    const signer = useAppStore((state) => state.signer);
    const userAddress = useAppStore((state) => state.userAddress);

    const { mutate: lockWallet, isPending } = useMutation({
      mutationFn: async () => {
        if (!signer) throw new Error("Signer not connected");
        return await submitLockTransaction({
          contractAddress: walletAddress,
          signer,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["wallets", userAddress],
          exact: true,
        });
        setShowConfirmation(false);
        onSuccess?.();
      },
    });

    return (
      <>
        <button
          className="btn btn-error btn-sm"
          onClick={() => setShowConfirmation(true)}
          title="Lock wallet permanently"
          disabled={isPending}
        >
          {isPending ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <LockClosedIcon className="size-4 text-white" />
          )}
        </button>

        <ConfirmationModal
          isOpen={showConfirmation}
          title="Wallet Lock Confirmation"
          description={`This will create lock transaction. Requires ${requiredSignatures} owner(s) signatures to lock the wallet.`}
          confirmText="Confirm Lock"
          cancelText="Cancel"
          icon={<LockClosedIcon className="h-6 w-6" />}
          isProcessing={isPending}
          onConfirm={() => lockWallet()}
          onCancel={() => setShowConfirmation(false)}
          variant="destructive"
        />
      </>
    );
  }
);

export default LockWalletButton;
