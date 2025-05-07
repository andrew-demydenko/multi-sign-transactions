import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  restoreConnection,
  connectAccount,
  disconnectAccount,
  createInfuraProvider,
} from "@/services/account-service";
import { processPendingTxs } from "@/services/provider-service";
import { ethers } from "ethers";
import { useAppStore } from "@/stores/app-store";
import { getOrCreateUser } from "@/services/user-service";

export const useCheckAccountUnlock = () => {
  const [isUnlocked, setIsUnlocked] = useState(true);

  const handleUnlock = useCallback(async () => {
    try {
      const value = await window.ethereum?.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      if (value) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.error("Error requesting unlock:", error);
    }
  }, []);

  const checkUnlock = useCallback(async () => {
    const isUnlock =
      window.ethereum?.isUnlock || window.ethereum?._metamask?.isUnlocked;
    if (!isUnlock) {
      console.error("isUnlock method is not available on window.ethereum");
      return;
    }
    try {
      const value = await isUnlock();
      if (!value) {
        handleUnlock();
      }
      setIsUnlocked(value);
    } catch (error) {
      console.error("Error checking unlock status:", error);
    }
  }, [handleUnlock]);

  return { isUnlockedAccount: isUnlocked, checkIsUnlockedAccount: checkUnlock };
};

export const useFetchBalance = () => {
  const setBalance = useAppStore((state) => state.setBalance);
  const userAddress = useAppStore((state) => state.userAddress);
  const infuraProvider = useAppStore((state) => state.infuraProvider);
  const network = useAppStore((state) => state.network);

  const fetchBalanceQuery = useQuery({
    queryKey: ["user-balance", userAddress, network],
    queryFn: async () => {
      try {
        const balance = (await infuraProvider?.getBalance(userAddress)) || "0";
        return { balance: ethers.formatEther(balance) };
      } catch (e) {
        console.error(e);
      }

      return { balance: "0" };
    },
    staleTime: 10000,
    enabled: !!infuraProvider && !!userAddress,
    retry: 1,
  });

  useEffect(() => {
    if (fetchBalanceQuery.data && userAddress) {
      setBalance(fetchBalanceQuery.data.balance);
    }
  }, [fetchBalanceQuery.data, setBalance, userAddress]);

  return fetchBalanceQuery;
};

export const useAccountInitiazation = () => {
  const setUserData = useAppStore((state) => state.setUserData);
  const setData = useAppStore((state) => state.setData);
  const setNetwork = useAppStore((state) => state.setNetwork);
  const setProviders = useAppStore((state) => state.setProviders);
  const userAddress = useAppStore((state) => state.userAddress);
  const balanceQuery = useFetchBalance();

  const fetchUserQuery = useQuery({
    queryKey: ["user", userAddress],
    queryFn: () => getOrCreateUser({ userAddress }),
    enabled: !!userAddress,
    staleTime: 10000,
    retry: 1,
  });

  const restoreSessionQuery = useQuery({
    queryKey: ["restoreConnectionSession"],
    queryFn: restoreConnection,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectAccount();
        window.location.reload();
      } else {
        try {
          const newSession = await connectAccount();
          setData(newSession);
        } catch (error) {
          console.error("Failed to reconnect:", error);
          disconnectAccount();
          window.location.reload();
        }
      }
    };

    const handleChainChanged = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const infuraProvider = createInfuraProvider();
      const network = await provider.getNetwork();

      localStorage.setItem("network", network.name);

      setNetwork({ network: network.name });
      setProviders({ provider, infuraProvider });
    };

    const handleDisconnect = () => {
      disconnectAccount();
    };

    const handleAccountMessage = (message: string) => {
      console.info("Сообщение от провайдера:", message);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", handleDisconnect);
    window.ethereum.on("message", handleAccountMessage);

    return () => {
      window.ethereum.removeAllListeners();
    };
  }, [setData, setNetwork, setProviders]);

  useEffect(() => {
    if (fetchUserQuery.data) {
      setUserData(fetchUserQuery.data);
    }
  }, [fetchUserQuery.data, setUserData]);

  useEffect(() => {
    if (restoreSessionQuery.data) {
      setData(restoreSessionQuery.data);

      processPendingTxs();
    }
  }, [restoreSessionQuery.data, setData]);

  return { ...fetchUserQuery, ...restoreSessionQuery, ...balanceQuery };
};

export const useConnectWallet = () => {
  const setData = useAppStore((state) => state.setData);

  const mutation = useMutation({
    mutationFn: connectAccount,
  });

  useEffect(() => {
    if (mutation.data) {
      setData(mutation.data);
    }
  }, [mutation.data, setData]);

  return mutation;
};
