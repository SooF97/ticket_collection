import React, { useState, useEffect } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";

import { useRouter } from "next/router";

import standardTicketCollection from "./standardTicketCollection.json";

import Loading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { create as ipfsHttpClient } from "ipfs-http-client";
import { setTokenSourceMapRange } from "typescript";

//import sfnMarket from "./sfnMarket.json";

const projectId = "2MyNroGl6iLE7zAs4P4RNLzSAES";
const projectSecret = "72901dfa73bf4a41fe20077f44f2aa0b";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default function Home() {
  const [fileMinted, setFileMinted] = useState(false);

  const [ticketType, setTicketType] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(0);

  const [finalCost, setFinaleCost] = useState("");

  const [to, setTo] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [ticketUri, setTicketUri] = useState("");
  const [ethprice, setEthPrice] = useState(0);

  function handleNumberOfTickets(e) {
    setNumberOfTickets(e.target.value);
    console.log(e.target.value);
    console.log(typeof parseInt(e.target.value));
  }

  async function uploadMetadataToIpfs() {
    const _ticketType = "Ticket";
    const _ticketDescription = "This is a ticket to football match ...";
    const _ticketPrice = "0.003";
    const _event = "MOROCCO vs BRAZIL";
    const _date = "20/08/2023";
    const _time = "20H00 GMT+1";
    const _ticketImage =
      "https://gateway.pinata.cloud/ipfs/QmYSbfFJdJRJs4digjbq1kAw63uGMAJWcNLKoVFLGw3iPR?_gl=1*hrkcce*_ga*YTdkMjg0MjAtNDVkMS00MDI3LWFhMmItZTg2Yjc3YjUzYjVk*_ga_5RMPXG14TE*MTY4MDI3NDM4OC4zOC4xLjE2ODAyNzQ0MDIuNDYuMC4w";
    setTicketType(_ticketType);
    setTicketDescription(_ticketDescription);
    setTicketPrice(_ticketPrice);
    setEvent(_event);
    setDate(_date);
    setTime(_time);
    setImageUrl(
      "https://gateway.pinata.cloud/ipfs/QmYSbfFJdJRJs4digjbq1kAw63uGMAJWcNLKoVFLGw3iPR?_gl=1*hrkcce*_ga*YTdkMjg0MjAtNDVkMS00MDI3LWFhMmItZTg2Yjc3YjUzYjVk*_ga_5RMPXG14TE*MTY4MDI3NDM4OC4zOC4xLjE2ODAyNzQ0MDIuNDYuMC4w"
    );

    /* first, upload to IPFS */
    const data = JSON.stringify({
      ticketType: _ticketType,
      ticketDescription: _ticketDescription,
      ticketPrice: _ticketPrice,
      event: _event,
      date: _date,
      time: _time,
      image: _ticketImage,
    });
    try {
      const added = await client.add(data, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const uri = `https://sfnmarket.infura-ipfs.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      console.log(uri);
      setTicketUri(uri);
      return uri;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function mintTicket() {
    const numberOfTicketsToMint = numberOfTickets;
    const standardTicketPriceInWei = ethers.utils.parseUnits("0.003", "ether");
    const totalCost = standardTicketPriceInWei.mul(numberOfTicketsToMint);
    setFinaleCost(totalCost);
    setFileMinted(true);
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const _to = await signer.getAddress();
      setTo(_to);

      const contract = new ethers.Contract(
        standardTicketCollection.address,
        standardTicketCollection.abi,
        signer
      );
      let transaction = await contract.mintStandardTicket(
        ticketUri,
        numberOfTickets,
        {
          value: totalCost,
        }
      );
      let tx = await transaction.wait();
      console.log(tx);
      toast(`Congrats! you have bought ${numberOfTicketsToMint} ticket(s)`, {
        type: "success",
      });
    } catch (error) {
      console.log(error);
    }
    setFileMinted(false);
  }

  async function pricePerTicket() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const contract = new ethers.Contract(
        standardTicketCollection.address,
        standardTicketCollection.abi,
        provider
      );
      const price = await contract.getTicketPrice();
      console.log(price.toString());
      const weiPrice = price;
      const ethPrice = ethers.utils.formatEther(weiPrice);
      console.log(typeof parseInt(ethPrice));
      setEthPrice(parseInt(ethPrice));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    uploadMetadataToIpfs();
    pricePerTicket();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="flex flex-col justify-center justify-items-center content-center items-center mt-4 text-white gap-1">
        <div>
          <h1 className="mt-0 mb-2 p-4 text-2xl font-medium leading-tight text-primary">
            Neftup is a decentralized application designed to streamline the
            process of minting NFT tickets on the Polygon network. By leveraging
            blockchain technology, Neftup offers a secure, transparent, and
            efficient platform for creating and managing event tickets as
            non-fungible tokens. With its user-friendly interface and seamless
            integration with the Polygon ecosystem, Neftup paves the way for a
            novel approach to event ticketing, enabling event organizers and
            attendees to experience the benefits of decentralized ticketing,
            such as reduced fraud, lower fees, and improved traceability.
          </h1>
        </div>
        <span>Event : {event} </span>
        <span>
          Date : {date} at {time}
        </span>
        <span>Ticket price : {ticketPrice} MATIC</span>
        <img
          className="border bg-black shadow rounded-xl overflow-hidden"
          src={imageUrl}
          width={300}
          height={300}
          alt=""
        />
      </div>
      <div className="flex flex-col justify-center justify-items-center content-center items-center mt-10  gap-1">
        <label className="text-white">Put number of Tickets to buy : </label>{" "}
        <input
          type="number"
          placeholder="Enter number..."
          onChange={handleNumberOfTickets}
          className="h-8 p-1 text-black"
          required
        />
        <button
          className="mt-6 m-auto mt-4 bg-white text-black rounded p-4 hover:bg-violet-500 font-bold focus:ring focus:ring-violet-300"
          onClick={mintTicket}
        >
          Buy
        </button>
        <CrossmintPayButton
          clientId="03653e53-8378-429f-a9dc-07e11dfaf00c"
          mintConfig={{
            type: "erc-721",
            totalPrice: (0.003 * 3).toString(),
            _tokenUri: ticketUri,
            _numberOfTicketToMint: "3",
          }}
          environment="staging"
        />
        {fileMinted && (
          <div className="m-auto flex justify-center">
            <Loading type="spin" color="white" height={20} width={20} />
          </div>
        )}
      </div>
    </div>
  );
}
