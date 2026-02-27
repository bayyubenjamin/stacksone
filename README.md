# 🌌 StacksOne Vault Ecosystem

![CI](https://github.com/bayyubenjamin/stacksone/actions/workflows/clarinet.yaml/badge.svg)
![Stacks](https://img.shields.io/badge/Network-Stacks_Mainnet-5546FF?style=for-the-badge&logo=stacks)
![Clarity](https://img.shields.io/badge/Smart_Contracts-Clarity_2.0-black?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react)

**StacksOne Vault** is a gamified Web3 identity and progression protocol built on the **Stacks** blockchain.

It enables users to complete on-chain missions, earn Experience Points (XP), level up, and mint exclusive SIP-009 NFT badges — fully verifiable on-chain.

> 🔒 Production-grade Clarity contracts  
> ✅ Automated test suite (Vitest + Clarinet Simnet)  
> 🚀 GitHub Actions CI enabled  

---

# 🏗️ Architecture Overview (v10 Ecosystem)

StacksOne Vault utilizes a scalable tri-contract architecture designed for modularity and upgrade safety.

## 1️⃣ genesis-core-v10.clar — The Brain
- Manages user XP & Level state  
- Routes mission completion  
- Handles badge claims  
- Computes dynamic level progression  

```

level = (XP / 500) + 1

```

## 2️⃣ genesis-missions-v10.clar — The Tracker
- Enforces 144 block-height cooldown for daily check-in  
- Prevents duplicate mission claims  
- Accepts write calls only from authorized Core contract  

## 3️⃣ genesis-badges-v10.clar — The Vault
- Fully SIP-009 compliant NFT contract  
- On-chain metadata URI (IPFS)  
- Minting restricted to authorized Core contract only  

---

# 🔐 Dual-Authorization Security Model

Supporting contracts implement a dual-authorization upgrade-safe structure.

### admin (Principal)
- Deployer wallet  
- Permanent authority  
- Can re-route ecosystem to new Core contract  
- Functions:
  - transfer-admin  
  - set-game-core  

### game-core-address (Principal)
- Current operational Core contract  
- Authorized to mint NFTs and modify XP  

This ensures:
- No contract lockout  
- Safe upgradability  
- Long-term protocol resilience  

---

# 🪙 Token Layer — SIP-010 (token-one.clar)

StacksOne includes a SIP-010 fungible token implementation.

Features:
- Owner-controlled minting  
- Approved minter system  
- Transfer validation (tx-sender enforcement)  
- Strict zero-amount validation  

Fully tested via automated test suite.

---

# 🎮 Game Layer Expansion (Modular Add-ons)

StacksOne now includes lightweight engagement modules deployed independently from the core logic.

## 🎲 genesis-lucky-v1.clar — Lucky Draw
- On-chain roll counter  
- Ultra-low gas interaction  
- Engagement loop module  

Functions:
- `roll()`  
- `get-rolls(principal)`  

---

## ⚔️ genesis-duel-v1.clar — Duel Arena
- Combat score counter  
- Stateless increment logic  

Functions:
- `fight()`  
- `get-score(principal)`  

---

## 🔢 genesis-predict-v1.clar — Prediction Room
- On-chain number submission  
- Minimal write storage  

Functions:
- `predict(uint)`  
- `get-prediction(principal)`  

---

# 🔥 Boost Module

## genesis-boost-v1.clar — XP Lock & Multiplier Layer

Modular progression enhancement contract.

Features:
- Lock XP simulation  
- Boost multiplier storage  
- Unlock reset logic  
- Gas-efficient state updates  

Functions:
- `lock-xp(uint)`  
- `unlock-xp()`  
- `get-locked(principal)`  
- `get-boost(principal)`  

---

# 🧩 Modular Ecosystem Overview

StacksOne operates as a multi-layer ecosystem:

Core Layer:
- XP & Level engine  
- Mission routing  
- Badge gating  

Token Layer:
- SIP-010 fungible token  

Identity Layer:
- SIP-009 NFT badge vault  

Engagement Layer:
- Lucky Draw  
- Duel Arena  
- Prediction Room  

Boost Layer:
- XP Lock Multiplier  

Design Principles:
- Non-destructive upgrades  
- Modular expansion  
- Isolated contract logic  
- Upgrade-safe routing  
- Reduced protocol risk  

---

# 🧪 Automated Testing & CI

This repository includes a complete smart contract testing suite.

### ✔ Vitest + Clarinet Simnet
- Metadata validation  
- Mint authorization tests  
- Transfer logic tests  
- Security edge case coverage  

### ✔ GitHub Actions CI
- Automated test execution on every push  
- Node 18 runner  
- Clean install per job  

Run tests locally:

```

cd smart-contracts
npm install
npm run test

```

---

# ✨ Key Features

### 📅 Daily On-Chain Check-In
Earn base XP with enforced cooldown.

### 🎯 Mission Board
Dynamic tasks for protocol interaction.

### 📈 Level Progression
XP auto-converts to Levels.

### 🏅 NFT Badge Gating

| Badge | Requirement |
|--------|--------------|
| Genesis Pioneer | Level 1 |
| Node Operator | Level 2 (500 XP) + Genesis |
| Protocol Guardian | Level 5 (2000 XP) + Node |

---

# 🚀 Deployment Guide (Mainnet)

## 1️⃣ Generate Deployment Plan

```

clarinet deployments generate --mainnet --low-cost
clarinet deployments apply --mainnet

```

## 2️⃣ Contract Wiring (Critical)

From admin wallet:

### In genesis-badges-v10
Call:

```

set-game-core
'<YOUR_WALLET>.genesis-core-v10

```

### In genesis-missions-v10
Call:

```

set-game-core
'<YOUR_WALLET>.genesis-core-v10

```

## 3️⃣ Initialize Badge Registry

Call `create-badge` in genesis-core-v10.

### Genesis Badge
- name: "genesis"
- uri: "ipfs://..."
- xp-req: u0
- level-req: u1
- prereq-badge: none

### Node Badge
- name: "node"
- uri: "ipfs://..."
- xp-req: u500
- level-req: u2
- prereq-badge: genesis

### Guardian Badge
- name: "guardian"
- uri: "ipfs://..."
- xp-req: u2000
- level-req: u5
- prereq-badge: node

---

# 🌐 Live Mainnet Contracts

Deployer:
SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3

Core:
- genesis-core-v10  

Missions:
- genesis-missions-v10  

Badges:
- genesis-badges-v10  

Token:
- token-one  

Reputation:
- reputation-engine  

Boost:
- genesis-boost-v1  

Games:
- genesis-lucky-v1  
- genesis-duel-v1  
- genesis-predict-v1  

---

# 🖥️ Frontend Stack

- React (Vite)  
- TailwindCSS  
- Framer Motion  
- @stacks/connect  
- @stacks/transactions  
- Supabase (off-chain caching layer)  

---

# 🛠️ Frontend Setup

```

git clone [https://github.com/bayyubenjamin/stacksone.git](https://github.com/bayyubenjamin/stacksone.git)
cd stacksone
npm install
npm run dev

```

## Ecosystem Structure

Genesis Protocol consists of modular smart contracts:

- Core Engine (state management)
- Game Modules (interaction layer)
- Aggregation & Ranking (planned extension)

Designed for:
- Gas efficiency
- Modular composability
- Progressive scoring model

---

# 📊 Engineering Maturity Signals

- Modular contract design  
- Upgrade-safe architecture  
- SIP-009 + SIP-010 compliance  
- Automated testing suite  
- CI/CD enabled  
- Security-first authorization model  
- Multi-contract mainnet deployment  
- Continuous ecosystem iteration  

---

# 👨‍💻 Author

Developed by **Bayu Benjamin**

GitHub: https://github.com/bayyubenjamin  
Ecosystem: Stacks / Web3 Builder
```
