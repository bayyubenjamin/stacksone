// updated at Sen 30 Mar 2026 23:21:08 WIB

![CI](https://github.com/bayyubenjamin/stacksone/actions/workflows/clarinet.yaml/badge.svg)
![Stacks](https://img.shields.io/badge/Network-Stacks_Mainnet-5546FF?style=for-the-badge&logo=stacks)
![Clarity](https://img.shields.io/badge/Smart_Contracts-Clarity_2.0-black?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react)

**StacksOne Vault** is a modular gamified Web3 identity and progression protocol built on the **Stacks** blockchain.

It enables users to:

- Complete on-chain missions  
- Earn Experience Points (XP)  
- Level up  
- Mint exclusive SIP-009 NFT badges  
- Accumulate competitive leaderboard score  
- Engage in modular game extensions  

Fully verifiable on-chain.

> 🔒 Production-grade Clarity contracts  
> 🧠 Modular multi-layer architecture  
> ✅ Automated test suite (Vitest + Clarinet Simnet)  
> 🚀 GitHub Actions CI enabled  

---

# 🏗️ Architecture Overview (v10 + Modular Expansion)

StacksOne Vault utilizes a scalable multi-contract architecture designed for modularity, upgrade safety, and progressive ecosystem growth.

---

## 🧠 Core Layer

### 1️⃣ genesis-core-v10.clar — The Brain
- Manages user XP & Level state  
- Routes mission completion  
- Handles badge claims  
- Computes dynamic level progression  

```
level = (XP / 500) + 1
```

---

### 2️⃣ genesis-missions-v10.clar — The Tracker
- Enforces 144 block-height cooldown for daily check-in  
- Prevents duplicate mission claims  
- Accepts write calls only from authorized Core contract  

---

### 3️⃣ genesis-badges-v10.clar — The Vault
- Fully SIP-009 compliant NFT contract  
- On-chain metadata URI (IPFS)  
- Minting restricted to authorized Core contract only  

---

# 🏆 Aggregation Layer — Leaderboard Engine (NEW)

## genesis-leaderboard-v1.clar — On-Chain Ranking Module

Lightweight aggregation contract designed to track engagement across modules.

Features:
- Gas-efficient score accumulation  
- Rank tier calculation  
- Stateless read logic  
- Event logging for interaction tracking  

Functions:

- `add-score(uint)`
- `get-score(principal)`
- `get-rank-tier(principal)`
- `reset-season()`

Rank Tiers:

| Tier | Score Requirement |
|------|-------------------|
| 0 | < 100 |
| 1 | ≥ 100 |
| 2 | ≥ 500 |
| 3 | ≥ 1000 |

This module integrates with game interactions to create a persistent competitive layer.

---

# 🎮 Engagement Layer (Modular Add-ons)

StacksOne includes lightweight independent engagement contracts.

---

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

# 🔥 Boost Layer

## genesis-boost-v1.clar — XP Lock & Multiplier

Progression enhancement contract.

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

# 🪙 Token Layer — SIP-010

## token-one.clar

StacksOne includes a SIP-010 fungible token implementation.

Features:
- Owner-controlled minting  
- Approved minter system  
- Transfer validation  
- Strict zero-amount validation  

Fully tested via automated suite.

---

# 🔐 Dual-Authorization Security Model

Supporting contracts implement a dual-authorization upgrade-safe structure.

### admin (Principal)
- Deployer wallet  
- Permanent authority  
- Can re-route ecosystem to new Core contract  

Functions:
- `transfer-admin`
- `set-game-core`

### game-core-address (Principal)
- Current operational Core contract  
- Authorized to mint NFTs and modify XP  

Ensures:
- No contract lockout  
- Safe upgradability  
- Long-term protocol resilience  

---

# 🧩 Modular Ecosystem Overview

StacksOne operates as a layered ecosystem:

### Core Layer
- XP & Level engine  
- Mission routing  
- Badge gating  

### Identity Layer
- SIP-009 NFT badge vault  

### Token Layer
- SIP-010 fungible token  

### Engagement Layer
- Lucky Draw  
- Duel Arena  
- Prediction Room  

### Boost Layer
- XP Multiplier  

### Aggregation Layer
- On-chain Leaderboard  
- Rank Tier System  

---

# 🧪 Automated Testing & CI

Complete smart contract testing suite included.

### ✔ Vitest + Clarinet Simnet
- Metadata validation  
- Mint authorization tests  
- Transfer logic tests  
- Security edge cases  

### ✔ GitHub Actions CI
- Automated test execution on every push  
- Node 18 runner  
- Clean install per job  

Run locally:

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

### 🏆 On-Chain Leaderboard
Competitive scoring across all engagement modules.

---

# 🚀 Deployment Guide (Mainnet)

## Generate Deployment Plan

```
clarinet deployments generate --mainnet --low-cost
clarinet deployments apply --mainnet
```

## Contract Wiring (Critical)

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

Leaderboard:
- genesis-leaderboard-v1  

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

# 📊 Engineering Maturity Signals

- Modular contract design  
- Upgrade-safe architecture  
- SIP-009 + SIP-010 compliance  
- Aggregation & ranking layer  
- Automated testing suite  
- CI/CD enabled  
- Multi-contract mainnet deployment  
- Continuous ecosystem iteration  

---

# 👨‍💻 Author

Developed by **Bayu Benjamin**

GitHub: https://github.com/bayyubenjamin  
Ecosystem: Stacks / Web3 Builder
// update 4 at Min 29 Mar 2026 20:50:47 WIB
// update 36 at Sen 30 Mar 2026 01:53:16 WIB
// update 64 at Sen 30 Mar 2026 05:52:08 WIB
// update 76 at Sen 30 Mar 2026 07:43:54 WIB
// update 79 at Sen 30 Mar 2026 08:06:24 WIB
// update 96 at Sen 30 Mar 2026 10:30:37 WIB
// update 129 at Sen 30 Mar 2026 15:45:00 WIB
// update 153 at Sen 30 Mar 2026 19:28:59 WIB
// update 158 at Sen 30 Mar 2026 20:22:10 WIB
// update 174 at Sen 30 Mar 2026 22:19:34 WIB
// update 10 at Sen 30 Mar 2026 23:44:39 WIB
// update 25 at Sel 31 Mar 2026 02:29:42 WIB
// update 28 at Sel 31 Mar 2026 02:45:37 WIB
// update 48 at Sel 31 Mar 2026 06:01:01 WIB
Dev update 3 Sel 31 Mar 2026 09:26:10 WIB
Dev update 7 Sel 31 Mar 2026 09:40:00 WIB
Dev update 11 Sel 31 Mar 2026 09:55:36 WIB
Dev update 13 Sel 31 Mar 2026 10:04:20 WIB
Dev update 15 Sel 31 Mar 2026 10:12:45 WIB
Dev update 18 Sel 31 Mar 2026 10:23:55 WIB
Dev update 28 Sel 31 Mar 2026 11:03:22 WIB
Dev update 30 Sel 31 Mar 2026 11:10:27 WIB
Dev update 34 Sel 31 Mar 2026 11:26:37 WIB
Dev update 37 Sel 31 Mar 2026 11:38:06 WIB
Dev update 38 Sel 31 Mar 2026 11:42:41 WIB
Dev update 40 Sel 31 Mar 2026 11:50:28 WIB
Dev update 42 Sel 31 Mar 2026 11:58:21 WIB
Dev update 48 Sel 31 Mar 2026 12:22:29 WIB
Dev update 52 Sel 31 Mar 2026 12:38:52 WIB
Dev update 58 Sel 31 Mar 2026 13:00:58 WIB
Dev update 60 Sel 31 Mar 2026 13:09:18 WIB
Dev update 77 Sel 31 Mar 2026 14:18:47 WIB
Dev update 81 Sel 31 Mar 2026 14:35:46 WIB
Dev update 2 Sel 31 Mar 2026 15:23:15 WIB
Dev update 3 Sel 31 Mar 2026 15:26:51 WIB
Dev update 6 Sel 31 Mar 2026 15:39:28 WIB
Dev update 21 Sel 31 Mar 2026 16:43:54 WIB
Dev update 31 Sel 31 Mar 2026 17:21:56 WIB
Dev update 32 Sel 31 Mar 2026 17:26:12 WIB
Dev update 36 Sel 31 Mar 2026 17:42:53 WIB
Dev update 44 Sel 31 Mar 2026 18:15:17 WIB
Dev update 47 Sel 31 Mar 2026 18:26:34 WIB
Dev update 51 Sel 31 Mar 2026 18:43:07 WIB
Dev update 58 Sel 31 Mar 2026 19:12:56 WIB
Dev update 60 Sel 31 Mar 2026 19:20:29 WIB
Dev update 68 Sel 31 Mar 2026 19:50:47 WIB
Dev update 71 Sel 31 Mar 2026 20:03:17 WIB
Dev update 77 Sel 31 Mar 2026 20:25:16 WIB
Dev update 83 Sel 31 Mar 2026 20:49:59 WIB
Dev update 84 Sel 31 Mar 2026 20:53:12 WIB
Dev update 86 Sel 31 Mar 2026 21:02:28 WIB
Dev update 90 Sel 31 Mar 2026 21:18:38 WIB
Dev update 94 Sel 31 Mar 2026 21:34:46 WIB
Dev update 95 Sel 31 Mar 2026 21:38:55 WIB
Dev update 100 Sel 31 Mar 2026 22:00:35 WIB
Dev update 110 Sel 31 Mar 2026 22:43:22 WIB
Dev update 111 Sel 31 Mar 2026 22:58:19 WIB
Dev update 117 Sel 31 Mar 2026 23:21:30 WIB
Dev update 118 Sel 31 Mar 2026 23:26:14 WIB
Dev update 130 Rab 01 Apr 2026 00:12:27 WIB
Dev update 138 Rab 01 Apr 2026 00:45:06 WIB
Dev update 139 Rab 01 Apr 2026 00:48:46 WIB
Dev update 141 Rab 01 Apr 2026 00:56:15 WIB
Dev update 145 Rab 01 Apr 2026 01:14:54 WIB
Dev update 148 Rab 01 Apr 2026 01:25:55 WIB
Dev update 7 Sab 04 Apr 2026 09:24:17 WIB
Dev update 13 Sab 04 Apr 2026 10:14:42 WIB
Dev update 14 Sab 04 Apr 2026 10:23:39 WIB
Dev update 17 Sab 04 Apr 2026 10:43:27 WIB
Dev update 22 Sab 04 Apr 2026 11:24:05 WIB
Dev update 28 Sab 04 Apr 2026 12:12:24 WIB
Dev update 37 Sab 04 Apr 2026 13:18:35 WIB
Dev update 59 Sab 04 Apr 2026 16:03:17 WIB
Dev update 60 Sab 04 Apr 2026 16:09:47 WIB
Dev update 62 Sab 04 Apr 2026 16:26:17 WIB
Dev update 77 Sab 04 Apr 2026 18:16:55 WIB
Dev update 79 Sab 04 Apr 2026 18:33:27 WIB
Dev update 83 Sab 04 Apr 2026 19:06:13 WIB
Dev update 89 Sab 04 Apr 2026 19:55:15 WIB
Dev update 91 Sab 04 Apr 2026 20:09:30 WIB
Dev update 95 Sab 04 Apr 2026 20:39:55 WIB
Dev update 98 Sab 04 Apr 2026 21:08:01 WIB
Dev update 99 Sab 04 Apr 2026 21:14:52 WIB
Dev update 132 Min 05 Apr 2026 01:21:04 WIB
Dev update 133 Min 05 Apr 2026 01:30:25 WIB
Dev update 134 Min 05 Apr 2026 01:35:34 WIB
Dev update 142 Min 05 Apr 2026 02:39:31 WIB
Dev update 146 Min 05 Apr 2026 03:08:30 WIB
Dev update 15 Min 05 Apr 2026 14:54:38 WIB
Dev update 16 Min 05 Apr 2026 15:01:49 WIB
Dev update 31 Min 05 Apr 2026 16:59:36 WIB
Dev update 34 Min 05 Apr 2026 17:21:34 WIB
Dev update 53 Min 05 Apr 2026 19:44:22 WIB
Dev update 62 Min 05 Apr 2026 20:48:01 WIB
Dev update 63 Min 05 Apr 2026 20:54:54 WIB
Dev update 68 Min 05 Apr 2026 21:31:08 WIB
Dev update 80 Min 05 Apr 2026 23:04:49 WIB
Dev update 81 Min 05 Apr 2026 23:09:59 WIB
Dev update 84 Min 05 Apr 2026 23:26:55 WIB
Dev update 86 Min 05 Apr 2026 23:42:03 WIB
Dev update 106 Sen 06 Apr 2026 02:08:45 WIB
Dev update 108 Sen 06 Apr 2026 02:26:44 WIB
Dev update 116 Sen 06 Apr 2026 03:29:09 WIB
Dev update 117 Sen 06 Apr 2026 03:36:43 WIB
Dev update 119 Sen 06 Apr 2026 03:48:42 WIB
Dev update 122 Sen 06 Apr 2026 04:11:34 WIB
Dev update 124 Sen 06 Apr 2026 04:21:42 WIB
Dev update 126 Sen 06 Apr 2026 04:37:31 WIB
Dev update 131 Sen 06 Apr 2026 05:10:44 WIB
Dev update 6 Sen 06 Apr 2026 18:39:52 WIB
Dev update 7 Sen 06 Apr 2026 18:48:00 WIB
Dev update 9 Sen 06 Apr 2026 19:03:30 WIB
Dev update 12 Sen 06 Apr 2026 19:27:12 WIB
Dev update 14 Sen 06 Apr 2026 19:42:04 WIB
Dev update 22 Sen 06 Apr 2026 20:46:18 WIB
Dev update 25 Sen 06 Apr 2026 21:07:54 WIB
Dev update 28 Sen 06 Apr 2026 21:27:53 WIB
Dev update 43 Sen 06 Apr 2026 23:28:19 WIB
Dev update 44 Sen 06 Apr 2026 23:38:41 WIB
Dev update 48 Sel 07 Apr 2026 00:10:04 WIB
Dev update 61 Sel 07 Apr 2026 01:42:43 WIB
Dev update 68 Sel 07 Apr 2026 02:34:55 WIB
Dev update 73 Sel 07 Apr 2026 03:11:24 WIB
Dev update 78 Sel 07 Apr 2026 03:48:48 WIB
Dev update 83 Sel 07 Apr 2026 04:25:58 WIB
Dev update 84 Sel 07 Apr 2026 04:33:11 WIB
Dev update 86 Sel 07 Apr 2026 04:50:35 WIB
Dev update 88 Sel 07 Apr 2026 05:06:26 WIB
Dev update 94 Sel 07 Apr 2026 05:43:00 WIB
Dev update 95 Sel 07 Apr 2026 05:49:22 WIB
Dev update 100 Sel 07 Apr 2026 06:29:19 WIB
Dev update 113 Sel 07 Apr 2026 08:14:29 WIB
Dev update 1 Rab 08 Apr 2026 10:54:15 WIB
Dev update 4 Rab 08 Apr 2026 11:18:29 WIB
Dev update 23 Rab 08 Apr 2026 13:35:10 WIB
Dev update 26 Rab 08 Apr 2026 13:55:56 WIB
Dev update 28 Rab 08 Apr 2026 14:11:27 WIB
Dev update 55 Rab 08 Apr 2026 17:28:39 WIB
Dev update 74 Rab 08 Apr 2026 19:52:56 WIB
Dev update 79 Rab 08 Apr 2026 20:24:37 WIB
Dev update 83 Rab 08 Apr 2026 20:55:01 WIB
Dev update 95 Rab 08 Apr 2026 22:21:48 WIB
Dev update 110 Kam 09 Apr 2026 00:13:47 WIB
Dev update 148 Kam 09 Apr 2026 05:00:14 WIB
Dev update 150 Kam 09 Apr 2026 05:17:21 WIB
Dev update 4 Kam 09 Apr 2026 09:15:09 WIB
Dev update 11 Kam 09 Apr 2026 10:02:27 WIB
Dev update 14 Kam 09 Apr 2026 10:23:29 WIB
Dev update 18 Kam 09 Apr 2026 10:56:56 WIB
Dev update 22 Kam 09 Apr 2026 11:26:44 WIB
Dev update 31 Kam 09 Apr 2026 12:33:59 WIB
Dev update 3 Jum 10 Apr 2026 11:33:58 WIB
Dev update 5 Jum 10 Apr 2026 11:50:26 WIB
Dev update 6 Jum 10 Apr 2026 11:57:25 WIB
Dev update 10 Jum 10 Apr 2026 12:22:23 WIB
Dev update 30 Jum 10 Apr 2026 14:53:02 WIB
Dev update 35 Jum 10 Apr 2026 15:30:32 WIB
Dev update 36 Jum 10 Apr 2026 15:36:46 WIB
Dev update 37 Jum 10 Apr 2026 15:45:09 WIB
Dev update 47 Jum 10 Apr 2026 17:00:26 WIB
Dev update 54 Jum 10 Apr 2026 17:48:55 WIB
Dev update 58 Jum 10 Apr 2026 18:18:03 WIB
Dev update 59 Jum 10 Apr 2026 18:27:47 WIB
Dev update 62 Jum 10 Apr 2026 18:49:55 WIB
Dev update 64 Jum 10 Apr 2026 19:04:49 WIB
Dev update 65 Jum 10 Apr 2026 19:11:28 WIB
Dev update 79 Jum 10 Apr 2026 20:55:32 WIB
Dev update 83 Jum 10 Apr 2026 21:29:31 WIB
Dev update 14 Sab 11 Apr 2026 15:54:51 WIB
Dev update 15 Sab 11 Apr 2026 16:02:08 WIB
Dev update 20 Sab 11 Apr 2026 16:35:09 WIB
Dev update 22 Sab 11 Apr 2026 16:46:09 WIB
Dev update 24 Sab 11 Apr 2026 17:01:55 WIB
Dev update 26 Sab 11 Apr 2026 17:14:40 WIB
Dev update 32 Sab 11 Apr 2026 18:08:23 WIB
Dev update 37 Sab 11 Apr 2026 18:45:56 WIB
Dev update 40 Sab 11 Apr 2026 19:04:47 WIB
Dev update 42 Sab 11 Apr 2026 19:19:33 WIB
Dev update 47 Sab 11 Apr 2026 19:56:04 WIB
Dev update 48 Sab 11 Apr 2026 20:05:38 WIB
Dev update 52 Sab 11 Apr 2026 20:40:05 WIB
Dev update 53 Sab 11 Apr 2026 20:48:58 WIB
Dev update 58 Sab 11 Apr 2026 21:19:09 WIB
Dev update 96 Min 12 Apr 2026 02:18:44 WIB
Dev update 101 Min 12 Apr 2026 02:56:20 WIB
Dev update 119 Min 12 Apr 2026 05:20:08 WIB
Dev update 123 Min 12 Apr 2026 05:50:35 WIB
Dev update 125 Min 12 Apr 2026 06:04:39 WIB
Dev update 126 Min 12 Apr 2026 06:13:39 WIB
Dev update 131 Min 12 Apr 2026 06:46:04 WIB
Dev update 139 Min 12 Apr 2026 07:44:06 WIB
Dev update 1 Min 12 Apr 2026 14:49:54 WIB
Dev update 2 Min 12 Apr 2026 14:58:51 WIB
Dev update 3 Min 12 Apr 2026 18:01:42 WIB
Dev update 10 Min 12 Apr 2026 18:56:19 WIB
Dev update 11 Min 12 Apr 2026 19:05:59 WIB
Dev update 16 Min 12 Apr 2026 19:44:26 WIB
Dev update 24 Min 12 Apr 2026 20:46:29 WIB
Dev update 26 Min 12 Apr 2026 20:59:41 WIB
Dev update 3 Sen 13 Apr 2026 09:21:15 WIB
Dev update 18 Sen 13 Apr 2026 10:49:53 WIB
Dev update 21 Sen 13 Apr 2026 11:09:51 WIB
Dev update 23 Sen 13 Apr 2026 11:24:27 WIB
Dev update 27 Sen 13 Apr 2026 11:46:50 WIB
Dev update 30 Sen 13 Apr 2026 12:01:53 WIB
Dev update 34 Sen 13 Apr 2026 12:29:31 WIB
Dev update 45 Sen 13 Apr 2026 13:33:33 WIB
Dev update 46 Sen 13 Apr 2026 13:39:18 WIB
Dev update 50 Sen 13 Apr 2026 13:59:23 WIB
Dev update 54 Sen 13 Apr 2026 14:22:34 WIB
Dev update 62 Sen 13 Apr 2026 15:14:16 WIB
Dev update 66 Sen 13 Apr 2026 15:41:38 WIB
Dev update 69 Sen 13 Apr 2026 16:02:05 WIB
Dev update 71 Sen 13 Apr 2026 16:15:45 WIB
Dev update 74 Sen 13 Apr 2026 16:32:05 WIB
Dev update 80 Sen 13 Apr 2026 17:04:12 WIB
Dev update 83 Sen 13 Apr 2026 17:20:19 WIB
Dev update 5 Sel 14 Apr 2026 08:59:13 WIB
Dev update 10 Sel 14 Apr 2026 09:23:02 WIB
Dev update 27 Sel 14 Apr 2026 11:03:25 WIB
Dev update 30 Sel 14 Apr 2026 11:21:41 WIB
Dev update 33 Sel 14 Apr 2026 11:40:45 WIB
Dev update 36 Sel 14 Apr 2026 11:58:25 WIB
Dev update 37 Sel 14 Apr 2026 12:04:01 WIB
Dev update 44 Sel 14 Apr 2026 12:44:18 WIB
Dev update 3 Rab 15 Apr 2026 09:06:46 WIB
Dev update 6 Rab 15 Apr 2026 09:22:45 WIB
Dev update 12 Rab 15 Apr 2026 09:59:40 WIB
Dev update 21 Rab 15 Apr 2026 10:51:48 WIB
Dev update 31 Rab 15 Apr 2026 11:55:32 WIB
Dev update 34 Rab 15 Apr 2026 12:16:02 WIB
Dev update 1 Rab 15 Apr 2026 23:02:08 WIB
Dev update 9 Rab 15 Apr 2026 23:51:58 WIB
Dev update 10 Rab 15 Apr 2026 23:59:37 WIB
Dev update 12 Kam 16 Apr 2026 00:11:19 WIB
Dev update 14 Kam 16 Apr 2026 00:20:15 WIB
Dev update 27 Kam 16 Apr 2026 01:41:26 WIB
Dev update 31 Kam 16 Apr 2026 02:05:13 WIB
Dev update 53 Kam 16 Apr 2026 04:14:15 WIB
Dev update 57 Kam 16 Apr 2026 04:40:59 WIB
Dev update 58 Kam 16 Apr 2026 04:48:43 WIB
Dev update 63 Kam 16 Apr 2026 05:18:57 WIB
Dev update 74 Kam 16 Apr 2026 06:26:14 WIB
Dev update 75 Kam 16 Apr 2026 06:32:20 WIB
Dev update 81 Kam 16 Apr 2026 07:04:30 WIB
Dev update 86 Kam 16 Apr 2026 07:28:07 WIB
Dev update 87 Kam 16 Apr 2026 07:35:50 WIB
Dev update 94 Kam 16 Apr 2026 08:20:13 WIB
Dev update 107 Kam 16 Apr 2026 09:40:49 WIB
Dev update 108 Kam 16 Apr 2026 09:48:06 WIB
Dev update 117 Kam 16 Apr 2026 10:47:10 WIB
Dev update 121 Kam 16 Apr 2026 11:12:41 WIB
Dev update 122 Kam 16 Apr 2026 11:19:54 WIB
Dev update 129 Kam 16 Apr 2026 12:03:13 WIB
Dev update 136 Kam 16 Apr 2026 12:44:49 WIB
Dev update 141 Kam 16 Apr 2026 13:10:54 WIB
Dev update 142 Kam 16 Apr 2026 13:16:30 WIB
Dev update 1 Kam 16 Apr 2026 13:20:05 WIB
Dev update 5 Kam 16 Apr 2026 15:02:35 WIB
Dev update 9 Kam 16 Apr 2026 15:30:34 WIB
Dev update 13 Kam 16 Apr 2026 15:53:24 WIB
Dev update 15 Kam 16 Apr 2026 16:03:11 WIB
Dev update 16 Kam 16 Apr 2026 16:07:58 WIB
Dev update 19 Kam 16 Apr 2026 16:27:34 WIB
Dev update 22 Kam 16 Apr 2026 16:48:56 WIB
Dev update 24 Kam 16 Apr 2026 17:00:55 WIB
Dev update 30 Kam 16 Apr 2026 17:35:33 WIB
Dev update 31 Kam 16 Apr 2026 17:39:36 WIB
Dev update 5 Kam 16 Apr 2026 18:52:32 WIB
Dev update 7 Kam 16 Apr 2026 19:02:38 WIB
Dev update 18 Kam 16 Apr 2026 20:06:46 WIB
Dev update 22 Kam 16 Apr 2026 20:31:10 WIB
Dev update 24 Kam 16 Apr 2026 20:43:44 WIB
Dev update 26 Kam 16 Apr 2026 20:56:01 WIB
Dev update 28 Kam 16 Apr 2026 21:09:39 WIB
Dev update 33 Kam 16 Apr 2026 21:44:57 WIB
Dev update 38 Kam 16 Apr 2026 22:14:32 WIB
Dev update 48 Kam 16 Apr 2026 23:11:42 WIB
Dev update 52 Kam 16 Apr 2026 23:37:46 WIB
Dev update 56 Kam 16 Apr 2026 23:59:13 WIB
Dev update 59 Jum 17 Apr 2026 00:20:27 WIB
Dev update 62 Jum 17 Apr 2026 00:36:28 WIB
Dev update 65 Jum 17 Apr 2026 00:54:43 WIB
Dev update 66 Jum 17 Apr 2026 01:00:31 WIB
Dev update 69 Jum 17 Apr 2026 01:21:08 WIB
Dev update 73 Jum 17 Apr 2026 01:44:32 WIB
Dev update 76 Jum 17 Apr 2026 02:03:40 WIB
Dev update 77 Jum 17 Apr 2026 02:07:44 WIB
Dev update 79 Jum 17 Apr 2026 02:18:21 WIB
Dev update 81 Jum 17 Apr 2026 02:28:03 WIB
Dev update 86 Jum 17 Apr 2026 02:54:52 WIB
Dev update 100 Jum 17 Apr 2026 04:18:28 WIB
Dev update 107 Jum 17 Apr 2026 05:06:06 WIB
Dev update 118 Jum 17 Apr 2026 06:11:43 WIB
Dev update 138 Jum 17 Apr 2026 08:14:21 WIB
Dev update 139 Jum 17 Apr 2026 08:20:43 WIB
Dev update 2 Jum 17 Apr 2026 11:29:12 WIB
Dev update 6 Jum 17 Apr 2026 11:55:33 WIB
Dev update 16 Jum 17 Apr 2026 12:55:06 WIB
Dev update 4 Sab 18 Apr 2026 08:59:47 WIB
Dev update 6 Sab 18 Apr 2026 09:14:55 WIB
Dev update 9 Sab 18 Apr 2026 09:35:57 WIB
Dev update 5 Sab 18 Apr 2026 10:10:37 WIB
Dev update 28 Sab 18 Apr 2026 12:32:43 WIB
Dev update 35 Sab 18 Apr 2026 13:20:17 WIB
Dev update 49 Sab 18 Apr 2026 14:58:36 WIB
Dev update 55 Sab 18 Apr 2026 15:36:35 WIB
Dev update 63 Sab 18 Apr 2026 16:27:15 WIB
Dev update 66 Sab 18 Apr 2026 16:44:34 WIB
Dev update 76 Sab 18 Apr 2026 17:48:29 WIB
Dev update 80 Sab 18 Apr 2026 18:18:32 WIB
Dev update 82 Sab 18 Apr 2026 18:33:18 WIB
Dev update 84 Sab 18 Apr 2026 18:43:17 WIB
Dev update 87 Sab 18 Apr 2026 19:01:49 WIB
Dev update 90 Sab 18 Apr 2026 19:23:40 WIB
Dev update 95 Sab 18 Apr 2026 19:55:19 WIB
Dev update 96 Sab 18 Apr 2026 20:02:20 WIB
Dev update 99 Sab 18 Apr 2026 20:20:33 WIB
Dev update 107 Sab 18 Apr 2026 21:10:42 WIB
Dev update 109 Sab 18 Apr 2026 21:25:42 WIB
Dev update 113 Sab 18 Apr 2026 21:50:17 WIB
Dev update 114 Sab 18 Apr 2026 21:58:20 WIB
Dev update 118 Sab 18 Apr 2026 22:24:59 WIB
Dev update 121 Sab 18 Apr 2026 22:43:35 WIB
Dev update 122 Sab 18 Apr 2026 22:49:04 WIB
Dev update 127 Sab 18 Apr 2026 23:20:46 WIB
Dev update 149 Min 19 Apr 2026 01:45:55 WIB
Dev update 154 Min 19 Apr 2026 02:17:31 WIB
Dev update 159 Min 19 Apr 2026 02:46:47 WIB
Dev update 161 Min 19 Apr 2026 02:58:46 WIB
Dev update 162 Min 19 Apr 2026 03:06:26 WIB
Dev update 163 Min 19 Apr 2026 03:12:35 WIB
Dev update 175 Min 19 Apr 2026 04:30:46 WIB
Dev update 182 Min 19 Apr 2026 05:12:19 WIB
Dev update 186 Min 19 Apr 2026 05:40:09 WIB
Dev update 192 Min 19 Apr 2026 06:20:03 WIB
Dev update 196 Min 19 Apr 2026 06:42:02 WIB
Dev update 201 Min 19 Apr 2026 07:13:43 WIB
Dev update 202 Min 19 Apr 2026 07:20:44 WIB
