// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract standardTicketCollection is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _standardTokenIds;

    // addresses of contract owner and event organizer
    address public contractOwner;
    address public eventOrganizer;

    // setting the standard tickets supply and the price per ticket
    uint256 public standardTicketSupply = 10;
    uint256 public standardTicketPrice = 0.003 ether;

    // possibility to pause the mint
    bool public mintStatus = true;

    // struct for tickets minted
    struct ticketMinted {
        uint256 _tokenId;
        string _tokenUri;
        address _ticketOwner;
    }

    // mapping to map every tokenId with their data
    mapping(uint256 => ticketMinted) public ticketMintedMapping;

    // array to store every data ticket minted
    ticketMinted[] public ticketMintedArray;

    constructor() ERC721("Ticket collection", "TKT") {
        contractOwner = payable(msg.sender);
        eventOrganizer = payable(0xf2035cd8140e654bA5e8c4e6FdFd15A6a7F763C1);
    }

    /* function to mint a standard ticket */
    function mintStandardTicket(
        string memory _tokenUri,
        uint256 _numberOfTicketToMint
    ) public payable nonReentrant returns (uint) {
        require(mintStatus, "Mint is paused!");
        require(
            _numberOfTicketToMint <= standardTicketSupply,
            "Supply achieved!"
        );
        require(
            _numberOfTicketToMint > 0,
            "Number of tickets to mint must be greater than 0!"
        );
        require(
            msg.value == standardTicketPrice * _numberOfTicketToMint,
            "Please, pay the exacte amount to purchase the ticket!"
        );
        uint256 newTokenId = 0;
        for (uint256 i = 1; i <= _numberOfTicketToMint; i++) {
            _standardTokenIds.increment();
            newTokenId = _standardTokenIds.current();
            require(
                newTokenId <= standardTicketSupply,
                "Standard supply sold out!"
            );
            _safeMint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, _tokenUri);
            ticketMintedMapping[newTokenId] = ticketMinted(
                newTokenId,
                _tokenUri,
                msg.sender
            );
            ticketMintedArray.push(ticketMintedMapping[newTokenId]);
        }
        payable(eventOrganizer).transfer((msg.value * 90) / 100);
        payable(contractOwner).transfer((msg.value * 10) / 100);

        return newTokenId;
    }

    function pauseMintOperation() public nonReentrant {
        require(
            msg.sender == eventOrganizer,
            "You are not the event organizer!"
        );
        require(mintStatus, "Mint is paused!");
        mintStatus = false;
    }

    function getTicketPrice() public view returns (uint256) {
        return standardTicketPrice;
    }

    function fetchMyNfts() public view returns (ticketMinted[] memory) {
        uint256 userBalance = balanceOf(msg.sender);
        ticketMinted[] memory userTickets = new ticketMinted[](userBalance);
        uint256 index = 0;
        for (uint256 i = 0; i < ticketMintedArray.length; i++) {
            if (ticketMintedArray[i]._ticketOwner == msg.sender) {
                userTickets[index] = ticketMintedArray[i];
                index = index + 1;
            }
        }
        return userTickets;
    }
}
