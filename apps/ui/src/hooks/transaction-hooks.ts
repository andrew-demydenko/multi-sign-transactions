import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/app-store";
import { fetchTransactions } from "@/services/transaction-service";

export const useFetchTransactions = () => {
  const userAddress = useAppStore((state) => state.userAddress);

  const fetchTransactionsQuery = useQuery({
    queryKey: ["transactions", userAddress],
    queryFn: () => fetchTransactions(userAddress!),
    staleTime: 10000,
    enabled: !!userAddress,
    retry: 0,
  });

  return fetchTransactionsQuery;
};
