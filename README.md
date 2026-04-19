# Stellar Soroban NFT Marketplace

A high-revenue, premium NFT marketplace built on the Stellar network using Soroban smart contracts.

![Desktop View](https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200)

## 🚀 Live Demo
- **URL**: [https://stellar-soroban-nft.netlify.app](https://stellar-soroban-nft.netlify.app)
- **CI Status**: ![CI](https://github.com/saasflare-online/chainnft/actions/workflows/ci.yml/badge.svg)

## ✨ Features
- **Freighter Integration**: Secure wallet connectivity and signing for all transactions.
- **Inter-Contract Architecture**: 
  - **NFT Contract**: Mint and manage unique assets with on-chain metadata.
  - **Royalty Splitter**: Automatic revenue distribution (50% Creator, 25% Platform, 25% Treasury).
  - **Marketplace**: Atomic listing and purchases using cross-contract calls.
- **Micro-Animations**: Smooth React-based UI with TailwindCSS and Lucide-React icons.
- **MongoDB Indexing**: Fast off-chain indexing of blockchain events for activity history.

## 🛠 Tech Stack
- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend/Indexer**: Node.js + Express + Mongoose (MongoDB)
- **Contracts**: Soroban Rust SDK
- **Wallet**: Freighter

## 📜 Verified Contract Addresses (Testnet)
| Contract | Address |
| --- | --- |
| **NFT** | `CAAERVDMPWVEOVRO24OZRT7MTQU4Q3FACQ3ABZVWXQR5TSSXH3FOEL7A` |
| **Marketplace** | `CDNTJDRFJZHLTY3BVWSBYKGJGJR3UDTWAX2PU65FEDNGB5CVMWGTZEKL` |
| **Royalty Splitter** | `CB4USENGKQMOW7AIENBSMNBBTISXBWWAHE63X6ZMTJ5JEQRRJ5ZSQWLL` |

> [!NOTE]
> **Production Ready**: These contracts are initialized and live. The Genesis NFT #1 is already listed and visible in the gallery.

## 🛠 Local Setup

### 1. Backend (Indexer & API)
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📄 License
MIT
