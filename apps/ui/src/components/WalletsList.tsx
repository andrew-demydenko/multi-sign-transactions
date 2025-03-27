import { useState, useCallback } from "react";
import TransactionsModal from "./TransactionsModal";
import WalletItem from "./WalletItem";
import { useAppStore } from "@/stores/app-store";
import { fetchUserWallets } from "@/services/provider-service";
import { useQuery } from "@tanstack/react-query";

const WalletsList = () => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const userAddress = useAppStore((state) => state.userAddress);
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets", userAddress],
    retry: 0,
    staleTime: 10000,
    queryFn: () => {
      if (!userAddress) return Promise.resolve([]);
      return fetchUserWallets(userAddress);
    },
    enabled: !!userAddress,
  });

  const viewTransactions = useCallback((walletAddress: string) => {
    setSelectedWallet(walletAddress);
  }, []);

  if (isLoading) {
    return <span className="loading loading-lg"></span>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Multi Sign Wallets</h2>

      {wallets?.length === 0 ? (
        <p className="text-gray-500">No wallets found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets?.map((wallet, index) => (
            <WalletItem
              key={wallet.walletAddress || index}
              wallet={wallet}
              onViewTransactions={viewTransactions}
            />
          ))}
        </div>
      )}

      <TransactionsModal
        walletAddress={selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </div>
  );
};

export default WalletsList;
