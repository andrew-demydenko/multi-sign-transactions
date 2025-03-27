import "./App.css";

import MultiSignWalletCreation from "@/components/WalletCreation";
import { useAppStore } from "@/stores/app-store";
import { useUserInitiazation, useConnectWallet } from "./hooks/user-hooks";
import { UserIcon } from "@heroicons/react/20/solid";
import { disconnectMetaMask } from "@/services/metamask-service";
import WalletsList from "@/components/WalletsList";

const Home = () => {
  const { isLoading } = useUserInitiazation();
  const { userAddress, balance } = useAppStore();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

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
          {isLoading ? (
            <span className="loading loading-spinner text-primary"></span>
          ) : !userAddress ? (
            <button
              onClick={() => connectWallet()}
              className="btn btn-primary"
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <>
              <MultiSignWalletCreation />
              <div className="dropdown dropdown-end ml-2">
                <label
                  tabIndex={0}
                  className="btn bg-primary btn-circle avatar"
                >
                  <UserIcon className="size-6 text-white" />
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-128"
                >
                  <li>
                    <div className="flex flex-row items-center justify-between">
                      <span className="text-xs opacity-50">
                        Connected Wallet
                      </span>
                      <span className="font-mono text-sm truncate">
                        {userAddress}
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between">
                      <span>Balance:</span>
                      <span>{parseFloat(balance).toFixed(4)} ETH</span>
                    </div>
                  </li>
                  <li className="border-t mt-2 pt-2">
                    <button
                      onClick={() => disconnectMetaMask()}
                      className="text-error"
                    >
                      Disconnect
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow p-6">
        {userAddress && !isLoading && <WalletsList />}
      </div>
    </div>
  );
};

export default Home;
