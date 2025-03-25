import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user-store";
import { fetchTransactions } from "@/services/transaction-service";

export const useFetchTransactions = () => {
  const userAddress = useUserStore((state) => state.userAddress);

  const fetchTransactionsQuery = useQuery({
    queryKey: ["transactions", userAddress],
    queryFn: () => fetchTransactions(userAddress!),
    staleTime: 10000,
    enabled: !!userAddress,
    retry: 0,
  });

  return fetchTransactionsQuery;
};
