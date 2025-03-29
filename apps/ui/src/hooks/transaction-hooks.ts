import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/app-store";
import { getTransactions } from "@/services/provider-service";

export const useFetchTransactions = ({
  walletAddress,
}: {
  walletAddress: string | null;
}) => {
  const provider = useAppStore((state) => state.provider);

  const fetchTransactionsQuery = useQuery({
    queryKey: ["transactions", walletAddress],
    queryFn: () => {
      if (!walletAddress || !provider) return Promise.resolve([]);
      return getTransactions({ contractAddress: walletAddress, provider });
    },
    staleTime: 1000 * 60,
    enabled: !!walletAddress && !!provider,
  });

  return fetchTransactionsQuery;
};
