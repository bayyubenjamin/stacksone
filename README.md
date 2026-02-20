# 🌌 StacksOne Vault Ecosystem

![Stacks](https://img.shields.io/badge/Network-Stacks_Mainnet-5546FF?style=for-the-badge&logo=stacks)
![Clarity](https://img.shields.io/badge/Smart_Contracts-Clarity_2.0-black?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react)

StacksOne Vault is a gamified Web3 identity and progression protocol built on the **Stacks** blockchain. It allows users to complete on-chain missions, earn Experience Points (XP), level up, and mint exclusive SIP-009 standard NFT badges as proof of their contribution and status within the ecosystem.

---

## 🏗️ System Architecture (v10 Ecosystem)

The protocol utilizes a highly scalable and upgradable tri-contract architecture:

### 1. `genesis-core-v10.clar` (The Brain)
- Manages the global state of user profiles (XP and Levels).
- Acts as the central router for claiming badges and completing missions.
- Calculates level progression dynamically using the formula:

```
level = (XP / 500) + 1
```

### 2. `genesis-missions-v10.clar` (The Tracker)
- Handles daily check-ins with a 144 block-height cooldown.
- Records completed tasks to prevent duplicate claims.
- Only accepts write operations from the authorized Core contract.

### 3. `genesis-badges-v10.clar` (The Vault)
- Fully compliant SIP-009 NFT contract.
- Stores on-chain metadata pointers (IPFS URIs).
- Minting is strictly restricted to the authorized Core contract when XP/Level requirements are met.

---

## 🔐 Dual-Authorization Security Model

To prevent lock-outs and ensure future upgradability, supporting contracts (Missions and Badges) implement a Dual-Authorization model:

- **`admin (Principal)`**
  - The wallet that deployed the contract.
  - Retains permanent rights to re-route the system to a new Core contract in the future.
  - Functions: `transfer-admin`, `set-game-core`.

- **`game-core-address (Principal)`**
  - The operational Core contract currently authorized to mint NFTs and add XP.

This structure allows seamless upgrades without breaking the ecosystem.

---

## ✨ Key Features

- **Daily On-Chain Check-in**  
  Users interact with the blockchain daily to earn base XP.

- **Mission Board**  
  Dynamic task system for protocol-specific actions with higher XP rewards.

- **Level Progression System**  
  XP automatically converts to Levels, gating access to higher-tier rewards.

- **NFT Badge Claiming**
  - **Genesis Pioneer** → Level 1
  - **Node Operator** → Level 2 (500 XP) + Genesis badge required
  - **Protocol Guardian** → Level 5 (2000 XP) + Node badge required

---

## 💻 Tech Stack

- **Smart Contracts**: Clarity (v2.0, Epoch 2.5), Clarinet
- **Frontend**: React (Vite), TailwindCSS, Framer Motion
- **Web3 Integration**:
  - `@stacks/connect`
  - `@stacks/network`
  - `@stacks/transactions`
- **Off-Chain Database**: Supabase (for caching user sessions and improving UI speed)

---

## 🚀 Deployment & Wiring Guide

Follow this exact sequence to ensure contracts communicate correctly without `u401` or `u102` errors.

### 1️⃣ Deploy Contracts

```bash
clarinet deployment generate --mainnet --low-cost
clarinet deployment apply --mainnet
```

### 2️⃣ Contract Authorization (The "Wiring")

After deployment, call the following functions from the `admin` wallet (via Stacks Explorer Sandbox or similar):

1. In `genesis-badges-v10`
   - Call: `set-game-core`
   - Input:
   ```
   '<YOUR_WALLET>.genesis-core-v10
   ```

2. In `genesis-missions-v10`
   - Call: `set-game-core`
   - Input:
   ```
   '<YOUR_WALLET>.genesis-core-v10
   ```

### 3️⃣ Initialize Badge Registry

Call `create-badge` in `genesis-core-v10` sequentially:

**Genesis Badge**
```
name: "genesis"
uri: "ipfs://..."
xp-req: u0
level-req: u1
prereq-badge: none
```

**Node Badge**
```
name: "node"
uri: "ipfs://..."
xp-req: u500
level-req: u2
prereq-badge: (some "genesis")
```

**Guardian Badge**
```
name: "guardian"
uri: "ipfs://..."
xp-req: u2000
level-req: u5
prereq-badge: (some "node")
```

---

## 🛠️ Frontend Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/bayyubenjamin/stacksone-vault.git
cd stacksone-vault/frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file in the frontend root and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

---

## 📜 License & Author

Developed with passion by **Bayu Benjamin**  
GitHub: https://github.com/bayyubenjamin
