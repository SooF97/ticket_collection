import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import axios from "axios";
import QRCode from "react-qr-code";

import standardTicketCollection from "./standardTicketCollection.json";

import Loading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getMyNfts = () => {
  const [nfts, setNfts] = useState([]);

  async function getUserNfts() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        standardTicketCollection.address,
        standardTicketCollection.abi,
        signer
      );
      let data = await contract.fetchMyNfts();
      console.log("here here", data);

      const items = await Promise.all(
        data.map(async (i) => {
          const tokenURI = await contract.tokenURI(i._tokenId);
          const meta = await axios.get(tokenURI);
          let item = {
            tokenId: i._tokenId.toString(),
            tokenURI,
            tokenOwner: i._ticketOwner,
            image: meta.data.image,
          };
          return item;
        })
      );
      console.log("items", items);
      setNfts(items);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUserNfts();
  }, []);

  if (!nfts.length)
    return <h1 className="py-10 px-20 text-3xl text-white">No NFTs owned</h1>;

  return (
    <div>
      <section className="overflow-hidden text-neutral-700">
        <div className="container mx-auto px-5 py-2 lg:px-32 lg:pt-12">
          <div className="-m-1 flex flex-wrap md:-m-2">
            <div className="flex w-1/3 flex-wrap gap-3 justify-center align-center">
              {nfts.map((nft, i) => (
                <div className="w-full p-1 md:p-2" key={i}>
                  <img
                    alt="gallery"
                    className="block h-80 w-80 rounded-lg object-cover object-center"
                    src={nft.image}
                  />
                  <div className="flex justify-center mt-3 rounded">
                    <QRCode value={nft.image} size={80} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default getMyNfts;
