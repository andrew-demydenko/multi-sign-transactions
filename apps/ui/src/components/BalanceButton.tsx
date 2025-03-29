import { useState, useEffect, useRef } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@/services/provider-service";
import { useAppStore } from "@/stores/app-store";
import { clsx } from "clsx";

interface BalanceButtonProps {
  walletAddress: string;
  className?: string;
}

const BalanceButton = ({ walletAddress, className }: BalanceButtonProps) => {
  const provider = useAppStore((state) => state.provider);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["balance", walletAddress],
    queryFn: () => getBalance({ contractAddress: walletAddress, provider }),
    enabled: showTooltip && !!provider,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setShowTooltip(!showTooltip)}
        className={clsx("btn btn-sm btn-ghost", className)}
        disabled={isLoading}
      >
        <CreditCardIcon className="size-5" />
      </button>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-10 w-36 -left-12 rounded-md bg-base-100 p-2 shadow-lg border border-base-300"
        >
          {error ? (
            <div className="text-error text-sm">Failed to load balance</div>
          ) : (
            <div className="text-sm">
              {isLoading ? (
                "Loading..."
              ) : (
                <div className="font-medium">Contract Balance:</div>
              )}
              <div className="font-mono">
                {balance ? `${balance} ETH` : "Loading..."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceButton;
