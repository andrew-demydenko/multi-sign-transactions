"use client";

import { useState } from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { useMutation } from "@tanstack/react-query";
import { createWallet } from "@/services/wallet-service";

const getDialogElement = () =>
  document.getElementById("wallet-creation") as HTMLDialogElement;

const MultiSignWalletCreation = () => {
  const [newOwner, setNewOwner] = useState<string>("");
  const {
    owners,
    addOwner,
    removeOwner,
    setRequiredSignatures,
    requiredSignatures,
  } = useWalletStore();
  const { mutate: saveWallet, isPending } = useMutation({
    mutationFn: createWallet,
  });

  return (
    <>
      <dialog id="wallet-creation" className="modal">
        <div className="modal-box text-left text-black">
          <h2 className="text-xl font-semibold mb-5 text-center">
            Create Multi-Sign Wallet
          </h2>
          <div className="join mb-3">
            <div>
              <label className="input join-item">
                <input
                  required
                  placeholder="Owner Address"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                />
              </label>
            </div>
            <button
              className="btn btn-success text-xs text-white join-item"
              onClick={() => {
                if (newOwner.trim()) {
                  addOwner(newOwner.trim());
                  setNewOwner("");
                }
              }}
            >
              Add Owner
            </button>
          </div>
          <ul className="max-h-[400px] overflow-auto list mb-2 bg-base-100 rounded-box shadow-md">
            {owners.map((owner, index) => (
              <li className="list-row" key={owner}>
                <div>
                  <span>{index + 1}.</span>
                  {owner}
                </div>
                <button
                  className="btn btn-error text-xs"
                  onClick={() => removeOwner(owner)}
                ></button>
              </li>
            ))}
          </ul>
          <div className="mb-2 join">
            <label className="label mr-3">Required Signatures</label>
            <input
              className="input"
              type="number"
              min={1}
              max={owners.length || 1}
              value={requiredSignatures}
              onChange={(e) => setRequiredSignatures(Number(e.target.value))}
            />
          </div>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              disabled={isPending}
              onClick={() => {
                saveWallet({
                  owners,
                  requiredSignatures,
                  walletAddress: "dsfsfdsfdsfdsfdsfdsfdsfdsf",
                });
              }}
            >
              {isPending ? "Saving Wallet" : "Create Wallet"}
            </button>
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
        Create Wallet
      </button>
    </>
  );
};

export default MultiSignWalletCreation;
