import "./App.css";
import Transactions from "@components/Transactions";
import MultiSignWalletCreation from "@/components/WalletCreation";
import { useAppStore } from "@/stores/app-store";
import { useUserInitiazation, useConnectWallet } from "./hooks/user-hooks";
import { getBalance } from "./services/provider-service";

const Home = () => {
  const { isLoading } = useUserInitiazation();
  const { userAddress, balance, provider } = useAppStore();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

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
      <button
        onClick={async () => {
          if (provider) {
            const r = await getBalance({
              contractAddress: "0x1e9080eaa655b3272073f7cc02f6592c1c06f310",
              provider,
            });
            console.log(r);
          }
        }}
      >
        Получить баланс
      </button>
      <div className="text-center mt-4">
        <span className="m-2">Working network</span>
        {import.meta.env.VITE_NETWORK?.toUpperCase()}
      </div>
    </div>
  );
};

export default Home;
