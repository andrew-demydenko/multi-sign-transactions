import { useMutation, useQuery } from "@tanstack/react-query";
import {
  restoreMetamaskSession,
  connectMetaMask,
} from "@/services/metamask-service";
import { useEffect } from "react";
import { ethers } from "ethers";
import { useUserStore } from "@/stores/user-store";
import { createOrModifyUser } from "@/services/user-service";

export const useFetchBalance = () => {
  const setBalance = useUserStore((state) => state.setBalance);
  const userAddress = useUserStore((state) => state.userAddress);
  const provider = useUserStore((state) => state.provider);

  const fetchBalanceQuery = useQuery({
    queryKey: ["user-balance", userAddress],
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
  const setUserData = useUserStore((state) => state.setUserData);
  const setData = useUserStore((state) => state.setData);
  const userAddress = useUserStore((state) => state.userAddress);
  const balanceQuery = useFetchBalance();

  const fetchUserQuery = useQuery({
    queryKey: ["user", userAddress],
    queryFn: () => createOrModifyUser({ userAddress }),
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
    if (fetchUserQuery.data) {
      setUserData(fetchUserQuery.data);
    }
  }, [fetchUserQuery.data, setUserData]);

  useEffect(() => {
    if (restoreSessionQuery.data) {
      setData(restoreSessionQuery.data);
    }
  }, [restoreSessionQuery.data, setData]);

  return { ...fetchUserQuery, ...restoreSessionQuery, ...balanceQuery };
};

export const useConnectWallet = () => {
  const setData = useUserStore((state) => state.setData);

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
