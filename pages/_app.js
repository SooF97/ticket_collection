// import { useState, useEffect } from "react";
// import { useAccount, useContract, useSigner } from "wagmi";
import "../styles/globals.css";
import Link from "next/link";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Web3Modal } from "@web3modal/react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

const App = ({ Component, pageProps }) => {
  // 1. Get projectID at https://cloud.walletconnect.com
  // if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  //   throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  // }
  const projectId = "7efb198848a979ee006db74bc37b7dd7";

  // 2. Configure wagmi client
  const chains = [polygonMumbai];

  const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains }),
    provider,
    theme: {
      background: "rgb(39, 49, 56)",
      main: "rgb(199, 199, 199)",
      secondary: "rgb(136, 136, 136)",
      border: "rgba(195, 195, 195, 0.14)",
      hover: "rgb(16, 26, 32)",
    },
  });

  // 3. Configure modal ethereum client
  const ethereumClient = new EthereumClient(wagmiClient, chains);
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <nav className=" flex justify-start content-center flex-wrap items-center gap-0.5 border-b p-6">
          <Link legacyBehavior href="/">
            <button className="text-2xl text-white ml-40 font-bold hover:bg-violet-500 ">
              Neftup Tickets
            </button>
          </Link>
          <Link legacyBehavior href="/getMyNfts">
            <a className=" text-md text-white ml-40 font-bold hover:bg-violet-500">
              Profile
            </a>
          </Link>
          <div className="flex gap-0.5 m-auto mt-4 text-white mr-3 rounded p-4">
            <Web3Button icon="show" label="Connect Wallet" balance="hide" />
            <Web3NetworkSwitch />
          </div>
        </nav>
        <Component {...pageProps} />
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          "--w3m-font-family": "Roboto, sans-serif",
          "--w3m-accent-color": "white",
          "--w3m-accent-fill-color": "black",
          "--w3m-background-color": "green",
        }}
      />
    </>
  );
};

export default App;
