import "./App.css";
import Transactions from "@components/Transactions";
import MultiSignWalletCreation from "@/components/WalletCreation";
import { useUserStore } from "@/stores/user-store";
import { useUserInitiazation, useConnectWallet } from "./hooks/user-hooks";

const Home = () => {
  const { isLoading } = useUserInitiazation();
  const { userAddress, balance } = useUserStore();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

  console.log(userAddress, balance);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Ethereum Dashboard</h1>
      {isLoading ? (
        <p>Loading session...</p>
      ) : !userAddress ? (
        <button
          onClick={() => connectWallet()}
          className="btn btn-primary"
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="text-center">
          <p className="text-lg">Connected: {userAddress}</p>
          <p className="text-lg mt-2">Balance: {balance} ETH</p>
          <Transactions userAddress={userAddress} />
        </div>
      )}
      <MultiSignWalletCreation />
    </div>
  );
};

export default Home;
