export interface ITransaction {
  id: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
}

export const fetchTransactions = async (
  userAddress: string
): Promise<ITransaction> => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/api/transactions/${userAddress}`
  );
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
};
