import { UserIcon } from "@heroicons/react/24/solid";
import WalletCreation from "./WalletCreation";
import { disconnectMetaMask } from "@/services/metamask-service";
import { useConnectWallet, useUserInitiazation } from "@/hooks/user-hooks";
import { useAppStore } from "@/stores/app-store";

const MetamaskControls = () => {
  const { isLoading } = useUserInitiazation();
  const { userAddress, balance } = useAppStore();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();

  if (isLoading)
    return <span className="loading loading-spinner text-primary"></span>;

  return userAddress ? (
    <div className="flex items-center">
      <WalletCreation />
      <div className="dropdown dropdown-end ml-2">
        <label tabIndex={0} className="btn bg-primary btn-circle avatar">
          <UserIcon className="size-6 text-white" />
        </label>
        <ul
          tabIndex={0}
          className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-128"
        >
          <li>
            <div className="flex flex-row items-center justify-between">
              <span className="text-xs opacity-50">Connected Wallet</span>
              <span className="font-mono text-sm truncate">{userAddress}</span>
            </div>
          </li>
          <li>
            <div className="flex justify-between">
              <span>Balance:</span>
              <span>{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          </li>
          <li className="border-t mt-2 pt-2">
            <button onClick={() => disconnectMetaMask()} className="text-error">
              Disconnect
            </button>
          </li>
        </ul>
      </div>
    </div>
  ) : (
    <button
      onClick={() => connectWallet()}
      className="btn btn-primary"
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};

export default MetamaskControls;
