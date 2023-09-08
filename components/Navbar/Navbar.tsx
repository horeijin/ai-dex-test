import { FC, useState, useEffect } from "react";
import Web3 from "web3";

interface Props {
  web3: Web3 | null;
  account: string | null;
  network: string | null;
  connectMetaMask: () => Promise<void>;
  disconnectMetaMask: () => void;
  setNetwork: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Navbar: FC<Props> = ({
  web3,
  account,
  network,
  connectMetaMask,
  disconnectMetaMask,
  setNetwork,
}) => {
  useEffect(() => {
    const fetchNetwork = async () => {
      if (web3 && account) {
        const netId = Number(await web3.eth.net.getId());
        const netName = getNetworkName(netId);
        setNetwork(netName);
      }
    };

    fetchNetwork();
  }, [web3, account]);

  const getNetworkName = (id: number) => {
    switch (id) {
      case 1:
        return "ETH Mainnet";
      case 5:
        return "Goerli";
      case 11155111:
        return "sepolia";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex flex-row items-center justify-between bg-opacity-20 backdrop-blur-md p-4 rounded-xl border border-gray-200 text-white">
      <div>
        <span className="mr-4">현재 Network : </span>
        <button className="bg-opacity-70 bg-white p-2 rounded hover:bg-opacity-80 mr-2">
          {network || "Not connected"}
        </button>
      </div>
      <div>
        <button
          onClick={connectMetaMask}
          className="bg-opacity-70 bg-white p-2 rounded hover:bg-opacity-80 mr-2"
        >
          {account ? `${account}` : "메타마스크 연결"}
        </button>
        {account && (
          <button
            onClick={disconnectMetaMask}
            className="bg-opacity-60 bg-red-500 p-2 rounded hover:bg-opacity-80"
          >
            연결 해제
          </button>
        )}
      </div>
    </div>
  );
};
