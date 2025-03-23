import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@radix-ui/themes";
import Transactions from "@components/Transactions";

const Home = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        updateBalance(accounts[0], provider);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const updateBalance = async (
    address: string,
    provider: ethers.BrowserProvider
  ) => {
    const balance = await provider.getBalance(address);
    setBalance(ethers.formatEther(balance));
  };

  const getData = async () => {
    const INFURA_URL = `https://mainnet.infura.io/v3/${
      import.meta.env.VITE_INFURA_API_KEY
    }`;
    const response = await fetch(INFURA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getLogs",
        params: [
          {
            fromBlock: "0x0",
            toBlock: "latest",
            address: account,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    if (account) {
      getData();
    }
  }, [account]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Ethereum Dashboard</h1>
      {!account ? (
        <Button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-lg">Connected: {account}</p>
          <p className="text-lg mt-2">Balance: {balance} ETH</p>
          <Transactions walletAddress={account} />
        </div>
      )}
    </div>
  );
};

export default Home;
