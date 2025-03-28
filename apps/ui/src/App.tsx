import "./App.css";

import MetamaskControls from "@/components/MetamaskControls";
import WalletsList from "@/components/WalletsList";
import { useAppStore } from "@/stores/app-store";

const Home = () => {
  const userAddress = useAppStore((state) => state.userAddress);
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex flex-1 items-center">
          <a className="btn btn-ghost normal-case text-xl mr-3">
            Multi Sign Wallet
          </a>
          <span>{import.meta.env.VITE_NETWORK?.toUpperCase()}</span>
        </div>

        <div className="flex-none gap-4">
          {window.ethereum ? (
            <MetamaskControls />
          ) : (
            <div className="mr-4">
              <h1 className="text-3xl font-bold">MetaMask not found</h1>
              <p className="text-gray-500 mt-2">
                Please install MetaMask to continue
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow p-6">{userAddress && <WalletsList />}</div>
    </div>
  );
};

export default Home;
