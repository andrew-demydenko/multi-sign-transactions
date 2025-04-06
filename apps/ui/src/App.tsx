import "./App.css";

import MetamaskProfile from "@/components/MetamaskProfile";
import WalletsList from "@/components/WalletsList";
import { useAppStore } from "@/stores/app-store";

const Home = () => {
  const userAddress = useAppStore((state) => state.userAddress);
  const network = useAppStore((state) => state.network);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex flex-1 items-center">
          <h1 className="normal-case text-xl mx-3 flex items-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-14 w-14 mr-2 rounded-md"
            />
            Multi Sign Wallets
          </h1>
          <span>{network?.toUpperCase()}</span>
        </div>

        <div className="flex-none gap-4">
          {window.ethereum ? (
            <MetamaskProfile />
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
