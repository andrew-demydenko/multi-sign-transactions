import { useState, useCallback } from "react";
import TransactionsModal from "./TransactionsModal";
import WalletItem from "./WalletItem";
import TransactionCreation from "./TransactionCreation";
import { useAppStore } from "@/stores/app-store";
import { fetchUserWallets } from "@/services/wallet-service";
import { useQuery } from "@tanstack/react-query";

const WalletsList = () => {
  const [walletForTransactionsModal, setWalletForTransactionsModal] = useState<
    string | null
  >(null);
  const [
    walletForTransactionCreationModal,
    setWalletForTransactionCreationModal,
  ] = useState<string | null>(null);
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

  const showTransactions = useCallback((walletAddress: string) => {
    setWalletForTransactionsModal(walletAddress);
  }, []);

  const showTransactionCreation = useCallback((walletAddress: string) => {
    console.log(walletAddress);
    setWalletForTransactionCreationModal(walletAddress);
  }, []);

  const closeTransactionsModal = useCallback(() => {
    setWalletForTransactionsModal(null);
  }, []);

  const closeTransactionCreationModal = useCallback(() => {
    setWalletForTransactionCreationModal(null);
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
              showTransactions={showTransactions}
              showTransactionCreation={showTransactionCreation}
            />
          ))}
        </div>
      )}

      <TransactionsModal
        walletAddress={walletForTransactionsModal}
        onClose={closeTransactionsModal}
      />
      <TransactionCreation
        walletAddress={walletForTransactionCreationModal}
        onClose={closeTransactionCreationModal}
      />
    </div>
  );
};

export default WalletsList;
