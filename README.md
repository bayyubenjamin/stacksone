# StacksOne  
## Web3 Loyalty & Dual-Token DeFi Ecosystem on Stacks

StacksOne is a Web3 loyalty and mini-DeFi ecosystem built on **Stacks (Bitcoin Layer-2)**.  
The platform combines on-chain reputation mechanics (NFT badges & XP system) with a dual-token economy designed to drive gamification, retention, and long-term engagement.

![StacksOne Banner](public/vite.svg)

---

## 🚀 Overview

StacksOne consists of two core pillars:

1. **Genesis System** – Loyalty & Reputation Framework  
2. **Vault Ecosystem** – Dual-Token DeFi Economy  

Together, they form a closed-loop on-chain incentive system that rewards participation and sustained engagement.

---

# 1️⃣ Genesis System (Loyalty & Reputation)

The Genesis System rewards users for meaningful on-chain activity.

### 🔹 Missions
Users complete on-chain tasks (e.g., verification or ecosystem interactions) to earn **XP (Experience Points)**.

### 🔹 Daily Check-In
Users can check in once per day to increase their reputation level and maintain engagement streaks.

### 🔹 NFT Badges (SBT-Compatible)
On-chain certificates (SIP-009 NFTs) representing user achievements:

- 🛡 **Genesis Badge** – Early adopter recognition  
- 💠 **Node Badge** – Network participation acknowledgment  
- 🆔 **Guardian Badge** – High reputation status  

These badges function as proof-of-participation and long-term identity markers within the ecosystem.

---

# 2️⃣ Vault Ecosystem (Dual-Token DeFi Model)

The Vault is a closed-loop token economy designed for sustainable gamification.

## 💰 Dual-Token Structure

### ⛽ $POIN (Fuel Token)
- High inflation token  
- Unlimited supply  
- Easily earned via daily activity  
- Designed for frequent use and burn mechanics  

### 💎 $ONE (Gem Token)
- Scarce premium token  
- Controlled emission  
- Earned via staking, burning, or special activities  
- Represents higher economic value  

---

## 🚰 The Faucet (Daily Distribution)

- Users can claim free `$POIN` every ~24 hours (~144 blocks).
- **Streak Bonus Mechanism:**  
  Consecutive claims increase rewards.

This encourages consistent daily engagement.

---

## 🔥 The Refinery (Staking System)

Mechanisms:
- **Burn-to-Earn**
- **Lock-to-Earn**

Users burn or lock `$POIN` to mine `$ONE`.

This reduces circulating supply while incentivizing long-term commitment.

---

## 🎰 Lucky Burn (On-Chain Gacha)

- Users burn `$POIN`
- Receive a probabilistic chance to win `$ONE` jackpots
- Uses simple on-chain RNG logic

Designed as a gamified sink mechanism for `$POIN`.

---

# 🏗 Smart Contract Architecture

All on-chain logic is written in **Clarity**, the smart contract language for Stacks.

| Contract Name | Primary Function | Category |
|---------------|------------------|----------|
| `genesis-core-v4` | Stores XP, levels, and check-in logic | Loyalty |
| `genesis-missions-v4` | Manages mission list and validation | Loyalty |
| `genesis-badges-v4` | SIP-009 NFT badge contract | Loyalty |
| `token-poin` | SIP-010 fungible token (utility token) | DeFi |
| `token-one` | SIP-010 fungible token (premium token) | DeFi |
| `faucet-distributor` | Daily reward & streak logic | Protocol Logic |
| `staking-refinery` | `$POIN` locking/burning → `$ONE` minting | Protocol Logic |
| `utility-gacha` | RNG-based burn game mechanism | Protocol Logic |

---

# 🛠 Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS  
- **Blockchain:** Stacks (Bitcoin Layer-2)  
- **Smart Contract Language:** Clarity  
- **Authentication:** Stacks Connect (Wallet-based Auth)  
- **Off-Chain Storage:** Supabase (non-critical profile metadata)  

---

# 💻 Local Development

## Prerequisites

- Node.js (v16+)
- Clarinet (for smart contract development)
- Stacks-compatible wallet (Leather / Xverse)

---

## 1️⃣ Clone & Install

```bash
git clone https://github.com/username/stacksone.git
cd stacksone
npm install
```

---

## 2️⃣ Run Frontend

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 3️⃣ Run Local Devnet (Optional)

To test contracts locally:

```bash
cd smart-contracts
clarinet integrate
```

---

# 🌐 Mainnet Deployment

Deployment is managed using **Clarinet**.

## Step 1: Configuration

Ensure `Mainnet.toml` contains the deployer wallet mnemonic.

⚠️ **Never commit this file to the repository.**

---

## Step 2: Deploy Contracts

```bash
clarinet deployment apply --mainnet
```

---

## Step 3: Post-Deployment Initialization (CRITICAL)

You must manually grant minting permissions between contracts using Stacks Explorer Sandbox:

1. `token-poin` → `add-minter` → `faucet-distributor`
2. `token-one` → `add-minter` → `staking-refinery`
3. `token-one` → `add-minter` → `utility-gacha`

Without this step, token emissions will not function.

---

# 🔐 Security Notes

- Dual-token emission is controlled via explicit minter permissions.
- `$ONE` supply is intentionally restricted.
- `$POIN` acts as a utility/burn sink token.
- Always verify deployment plans before executing on mainnet.

---

# 📜 License

This project is open-source and distributed under the **MIT License**.

---

# ✨ Vision

StacksOne aims to demonstrate how:

- Loyalty systems can be fully on-chain  
- Reputation can be composable  
- Gamified DeFi can improve retention  
- Bitcoin Layer-2 ecosystems can host sustainable micro-economies  

Built on Bitcoin. Powered by Stacks.

