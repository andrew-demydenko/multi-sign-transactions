import { useMutation, useQuery } from "@tanstack/react-query";
import {
  restoreMetamaskSession,
  connectMetaMask,
  disconnectMetaMask,
  createInfuraProvider,
} from "@/services/metamask-service";
import { processPendingTxs } from "@/services/provider-service";
import { useEffect } from "react";
import { ethers } from "ethers";
import { useAppStore } from "@/stores/app-store";
import { getOrCreateUser } from "@/services/user-service";

export const useFetchBalance = () => {
  const setBalance = useAppStore((state) => state.setBalance);
  const userAddress = useAppStore((state) => state.userAddress);
  const provider = useAppStore((state) => state.provider);
  const network = useAppStore((state) => state.network);

  const fetchBalanceQuery = useQuery({
    queryKey: ["user-balance", userAddress, network],
    queryFn: async () => {
      const balance = (await provider?.getBalance(userAddress)) || "0";

      return { balance: ethers.formatEther(balance) };
    },
    staleTime: 10000,
    enabled: !!provider && !!userAddress,
    retry: 1,
  });

  useEffect(() => {
    if (fetchBalanceQuery.data && userAddress) {
      setBalance(fetchBalanceQuery.data.balance);
    }
  }, [fetchBalanceQuery.data, setBalance, userAddress]);

  return fetchBalanceQuery;
};

export const useUserInitiazation = () => {
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
    queryKey: ["restoreMetamaskSession"],
    queryFn: restoreMetamaskSession,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectMetaMask();
        window.location.reload();
      } else {
        try {
          const newSession = await connectMetaMask();
          setData(newSession);
        } catch (error) {
          console.error("Failed to reconnect:", error);
          disconnectMetaMask();
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

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
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
    mutationFn: connectMetaMask,
  });

  useEffect(() => {
    if (mutation.data) {
      setData(mutation.data);
    }
  }, [mutation.data, setData]);

  return mutation;
};
