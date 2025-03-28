import { IWallet, IWalletResponse } from "@/types";

export const createWallet = async ({
  walletAddress,
  owners,
  requiredSignatures,
}: IWallet): Promise<IWallet> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/wallets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, owners, requiredSignatures }),
      }
    );
    if (!response.ok) throw new Error("Failed to create wallet");
    return response.json();
  } catch (error) {
    throw new Error(`Could not create wallet. ${error}`);
  }
};

export const fetchUserWallets = async (
  userAddress: string
): Promise<IWalletResponse[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/wallets/user/${userAddress}`
    );
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  } catch (error) {
    throw new Error(`Could not fetch user wallets. ${error}`);
  }
};

export const fetchWallet = async (walletAddress: string): Promise<IWallet> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/wallets/${walletAddress}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Could not fetch wallet. Please try again. ${error}`);
  }
};

export const deleteWallet = async ({
  walletAddress,
}: {
  walletAddress: string;
}): Promise<void> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/wallets/${encodeURIComponent(walletAddress)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete wallet: ${response.statusText}`);
    }

    await response.json();
  } catch (error) {
    throw new Error(`Failed to delete wallet: ${error}`);
  }
};
