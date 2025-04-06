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
  const network = useAppStore((state) => state.network);

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets", userAddress, network],
    retry: 0,
    staleTime: 10000,
    queryFn: () => {
      if (!userAddress) return Promise.resolve([]);
      return fetchUserWallets({ userAddress, network });
    },
    enabled: !!userAddress,
  });

  const showTransactions = useCallback((walletAddress: string) => {
    setWalletForTransactionsModal(walletAddress);
  }, []);

  const showTransactionCreation = useCallback((walletAddress: string) => {
    setWalletForTransactionCreationModal(walletAddress);
  }, []);

  const closeTransactionsModal = useCallback(() => {
    setWalletForTransactionsModal(null);
  }, []);

  const closeTransactionCreationModal = useCallback(() => {
    setWalletForTransactionCreationModal(null);
  }, []);

  return (
    <div className="pt-1">
      {wallets?.length === 0 && !isLoading ? (
        <p className="text-gray-500">No wallets found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <div className="skeleton h-70" />
              <div className="skeleton h-70" />
              <div className="skeleton h-70" />
            </>
          ) : (
            wallets?.map((wallet, index) => (
              <WalletItem
                key={wallet.walletAddress || index}
                wallet={wallet}
                showTransactions={showTransactions}
                showTransactionCreation={showTransactionCreation}
              />
            ))
          )}
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
