import { useState, memo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { confirmTransaction } from "@/services/provider-service";
import { useAppStore } from "@/stores/app-store";
import { TSigner } from "@/types";
import { clsx } from "clsx";

interface SignButtonProps {
  walletAddress: string;
  className?: string;
  txIndex: number;
}

interface ConfirmTransactionParams {
  contractAddress: string;
  txIndex: number;
  signer: TSigner;
}

const SignButton = memo(
  ({ walletAddress, className, txIndex }: SignButtonProps) => {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const queryClient = useQueryClient();
    const signer = useAppStore((state) => state.signer);
    const { mutate: confirmAction, isPending: isSigning } = useMutation({
      mutationFn: async (params: ConfirmTransactionParams) => {
        return await confirmTransaction(params);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["transactions", walletAddress],
          exact: true,
        });
      },
      onError: (error: { confirmed: boolean }) => {
        if (error.confirmed) {
          setIsConfirmed(true);
        }
      },
    });

    return (
      <button
        onClick={() =>
          confirmAction({
            contractAddress: walletAddress,
            txIndex,
            signer,
          })
        }
        className={clsx("btn btn-sm btn-primary", className)}
        disabled={!signer || isSigning || isConfirmed}
      >
        {isSigning ? (
          <>
            <span className="loading loading-spinner"></span>
            Signing...
          </>
        ) : isConfirmed ? (
          "Confirmed"
        ) : (
          "Sign"
        )}
      </button>
    );
  }
);

export default SignButton;
