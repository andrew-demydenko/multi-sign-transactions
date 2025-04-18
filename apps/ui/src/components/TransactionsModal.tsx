import { clsx } from "clsx";
import { useFetchTransactions } from "@/hooks/transaction-hooks";
import { Nullable } from "@/types";
import SignButton from "./SignButton";
import { LockClosedIcon } from "@heroicons/react/24/solid";

interface TransactionsModalProps {
  walletAddress: Nullable<string>;
  onClose: () => void;
}

const TransactionsModal = ({
  walletAddress,
  onClose,
}: TransactionsModalProps) => {
  const { data: transactions, isLoading } = useFetchTransactions({
    walletAddress,
  });

  return (
    <div className={clsx("modal", { "modal-open": !!walletAddress })}>
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">
          Transactions for {walletAddress?.slice(0, 8)}...
          {walletAddress?.slice(-4)}
        </h3>

        {!transactions?.length || isLoading ? (
          <p className="text-center py-8 text-gray-500">
            {isLoading ? "Loading..." : "No transactions found"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>To</th>
                  <th>Value (ETH)</th>
                  <th>Confirmations</th>
                  <th>Status</th>
                  <th>Lock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((tx, index) => (
                  <tr key={index}>
                    <td className="truncate max-w-40">{tx.to}</td>
                    <td>{tx.value}</td>
                    <td>{tx.numConfirmations}</td>
                    <td>
                      {tx.executed ? (
                        <span className="badge badge-success">Executed</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td>
                      {tx.isDestroy ? (
                        <LockClosedIcon
                          className="h-6 w-6 text-error"
                          title="Lock transaction"
                        />
                      ) : null}
                    </td>
                    <td>
                      {!tx.executed && (
                        <SignButton
                          walletAddress={walletAddress || ""}
                          txIndex={index}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsModal;
