import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import WalletCreation from "./WalletCreation";
import { disconnectAccount } from "@/services/account-service";
import {
  useConnectWallet,
  useAccountInitiazation,
} from "@/hooks/account-hooks";
import { useAppStore } from "@/stores/app-store";
import { useCopyToClipboard } from "@/hooks/common-hooks";
import ProfileEditorModal from "./ProfileEditorModal";

const UserControls = () => {
  const { isLoading } = useAccountInitiazation();
  const { userAddress, balance, userName } = useAppStore();
  const [isProfileEditorModalOpen, setIsProfileEditorModalOpen] =
    useState(false);
  const copyToClipboard = useCopyToClipboard();
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
          {userName ? (
            <li>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{userName || "Not set"}</span>
              </div>
            </li>
          ) : null}
          <li>
            <div className="flex flex-row items-center justify-between">
              <span className="text-xs opacity-50">Connected Wallet</span>
              <span
                onClick={() =>
                  copyToClipboard({
                    text: userAddress,
                    toastMessage: "User's wallet address is copied.",
                  })
                }
                className="font-mono text-sm truncate"
              >
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
          <li>
            <button onClick={() => setIsProfileEditorModalOpen(true)}>
              Edit Profile
            </button>
          </li>
          <li className="border-t mt-2 pt-2">
            <button onClick={() => disconnectAccount()} className="text-error">
              Disconnect
            </button>
          </li>
        </ul>
      </div>
      <ProfileEditorModal
        isOpen={isProfileEditorModalOpen}
        onClose={() => setIsProfileEditorModalOpen(false)}
      />
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

export default UserControls;
