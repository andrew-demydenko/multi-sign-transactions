import { useEffect, useState } from "react";

interface ITransaction {
  id: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  timestamp: number;
}

const Transactions = ({ walletAddress }: { walletAddress: string }) => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const getTransactions = async () => {
    console.log("Getting transactions for", walletAddress);
    setTransactions([]);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((transaction: ITransaction) => (
          <li key={transaction.id}>
            <p>From: {transaction.from}</p>
            <p>To: {transaction.to}</p>
            <p>Value: {transaction.value} ETH</p>
            <p>Block Number: {transaction.blockNumber}</p>
            <p>
              Timestamp:{" "}
              {new Date(transaction.timestamp * 1000).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transactions;
