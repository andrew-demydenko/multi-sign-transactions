import { useEffect, useState } from "react";

interface ITransaction {
  id: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  timestamp: number;
}

const getDialogElement = () =>
  document.getElementById("transaction-modal") as HTMLDialogElement;

const Transactions = ({ userAddress }: { userAddress: string }) => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const getTransactions = async () => {
    console.log("Getting transactions for", userAddress);
    setTransactions([]);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <>
      <dialog id="transaction-modal" className="modal">
        <div className="modal-box text-left text-black">
          <h2>Transactions</h2>
          <ul className="max-h-[400px] overflow-auto list mb-2 bg-base-100 rounded-box shadow-md">
            {transactions.map((transaction: ITransaction) => (
              <li className="list-row" key={transaction.id}>
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
          <div className="modal-action">
            <button onClick={() => getDialogElement().close()} className="btn">
              Close
            </button>
          </div>
        </div>
      </dialog>
      <button
        onClick={() => getDialogElement().showModal()}
        className="btn btn-primary"
      >
        Show Transactions
      </button>
    </>
  );
};

export default Transactions;
