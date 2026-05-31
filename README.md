# StacksOne

![Stacks](https://img.shields.io/badge/Network-Stacks-5546FF?style=for-the-badge&logo=stacks)
![Clarity](https://img.shields.io/badge/Smart%20Contracts-Clarity-black?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![NPM](https://img.shields.io/npm/v/@bayybays/stacksone-sdk?style=for-the-badge)

**StacksOne** is a fullstack Web3 identity, progression, mission, badge, and engagement ecosystem built on the **Stacks blockchain**.

This repository is designed as a combined project that contains:

- Frontend application
- SDK utilities
- Smart contract integration layer
- Stacks wallet connection logic
- On-chain progression helpers
- Documentation and developer examples

The SDK package is published as:

```txt
@bayybays/stacksone-sdk
```

---

## Overview

StacksOne provides a modular Web3 progression layer for applications and communities that want to build user reputation, identity, missions, badges, and engagement systems on top of Stacks.

The core idea is simple:

```txt
User connects wallet
        ↓
Completes missions
        ↓
Earns XP
        ↓
Levels up
        ↓
Unlocks badges
        ↓
Builds on-chain reputation
        ↓
Competes on leaderboard
```

StacksOne combines frontend UX, SDK helpers, and smart contract integration into one development-friendly repository.

---

## What This Repository Contains

```txt
StacksOne Repository
├── Frontend App
│   └── User interface for interacting with StacksOne
│
├── SDK Utilities
│   └── Reusable JavaScript helpers for wallet, contract, and user data
│
├── Smart Contract Integration
│   └── Contract addresses, read/write helpers, and interaction logic
│
├── Documentation
│   └── Protocol architecture, SDK usage, and deployment notes
│
└── Examples
    └── Example usage for developers and builders
```

This repo is intentionally structured as a **fullstack Web3 monorepo**, not a pure frontend-only project and not a pure SDK-only project.

---

## Key Features

### Frontend Application

StacksOne includes a React-based frontend for users to interact with the ecosystem.

Frontend capabilities may include:

- Wallet connection
- User profile display
- XP and level display
- Mission board
- Badge status
- Leaderboard UI
- Engagement modules
- Web3 interaction dashboard

---

### SDK Utilities

StacksOne also provides reusable SDK utilities that allow other developers to integrate with the protocol.

SDK capabilities may include:

- Wallet connection helpers
- Network configuration
- Contract address mapping
- User stats reading
- XP and level helpers
- Mission status helpers
- Badge eligibility helpers
- Leaderboard score helpers

---

### Smart Contract Integration

StacksOne is designed to interact with Clarity smart contracts on the Stacks blockchain.

Supported protocol modules include:

- Core progression contract
- Mission contract
- Badge NFT contract
- Token contract
- Leaderboard contract
- Reputation module
- Boost module
- Engagement modules

---

## Protocol Architecture

StacksOne uses a modular multi-layer architecture.

```txt
StacksOne Protocol
├── Core Layer
│   ├── XP management
│   ├── Level calculation
│   ├── Mission routing
│   └── Badge claim logic
│
├── Mission Layer
│   ├── Daily check-in
│   ├── Mission validation
│   ├── Cooldown protection
│   └── Duplicate claim prevention
│
├── Badge Layer
│   ├── SIP-009 NFT badges
│   ├── Badge metadata
│   ├── Badge ownership
│   └── Badge mint authorization
│
├── Token Layer
│   ├── SIP-010 token utility
│   ├── Token transfers
│   ├── Approved minters
│   └── Ecosystem incentives
│
├── Leaderboard Layer
│   ├── User score tracking
│   ├── Rank tier calculation
│   └── Competitive progression
│
├── Engagement Layer
│   ├── Lucky Draw
│   ├── Duel Arena
│   └── Prediction Room
│
└── Boost Layer
    ├── XP lock mechanics
    ├── Multiplier tracking
    └── Progression enhancement
```

---

## Core Concept

StacksOne is built around user progression.

Users can:

- Connect a Stacks wallet
- Complete on-chain missions
- Earn XP
- Increase their level
- Unlock NFT badges
- Build reputation
- Join leaderboard competition
- Interact with additional engagement modules

The protocol is modular, so new missions, games, rewards, and reputation systems can be added over time.

---

## Tech Stack

### Frontend

- React
- Vite
- TailwindCSS
- Lucide React
- React Router

### Web3 / Stacks

- `@stacks/connect`
- `@stacks/transactions`
- `@stacks/network`
- `@stacks/auth`
- `@stacks/common`

### Optional Backend / Cache Layer

- Supabase

### Smart Contracts

- Clarity
- SIP-009 NFT standard
- SIP-010 fungible token standard
- Clarinet for local contract testing

---

## Installation

Clone the repository:

```bash
git clone https://github.com/bayyubenjamin/stacksone.git
cd stacksone
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

---

## SDK Installation

If you only want to use the SDK package in another project:

```bash
npm install @bayybays/stacksone-sdk
```

Using yarn:

```bash
yarn add @bayybays/stacksone-sdk
```

Using pnpm:

```bash
pnpm add @bayybays/stacksone-sdk
```

---

## Frontend Usage

The frontend app is used to interact directly with the StacksOne ecosystem.

Basic development flow:

```bash
npm install
npm run dev
```

Then open the local development URL shown in the terminal.

Example:

```txt
http://localhost:5173
```

---

## SDK Usage

Basic SDK initialization:

```js
import { StacksOneClient } from '@bayybays/stacksone-sdk';

const client = new StacksOneClient({
  network: 'mainnet',
  appDetails: {
    name: 'My Stacks App',
    icon: 'https://example.com/icon.png'
  }
});
```

---

### Get User Stats

```js
const userStats = await client.getUserStats(
  'SP000000000000000000000000000000000000000'
);

console.log(userStats);
```

Example response:

```js
{
  address: 'SP000000000000000000000000000000000000000',
  xp: 1500,
  level: 4,
  score: 320,
  rankTier: 1
}
```

---

### Connect Wallet

```js
await client.connectWallet();
```

---

### Read Leaderboard Score

```js
const score = await client.getLeaderboardScore(
  'SP000000000000000000000000000000000000000'
);

console.log(score);
```

---

### Check Badge Eligibility

```js
const eligibility = await client.checkBadgeEligibility({
  user: 'SP000000000000000000000000000000000000000',
  badgeId: 1
});

console.log(eligibility);
```

---

## Recommended Project Structure

Because this project combines frontend and SDK logic, the recommended structure is:

```txt
stacksone/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── sdk/
│   ├── index.js
│   ├── client.js
│   ├── contracts.js
│   ├── network.js
│   ├── wallet.js
│   └── utils.js
│
├── smart-contracts/
│   ├── contracts/
│   ├── tests/
│   └── Clarinet.toml
│
├── docs/
│   ├── architecture.md
│   ├── sdk-api.md
│   ├── contracts.md
│   └── deployment.md
│
├── examples/
│   ├── react-vite/
│   └── node/
│
├── public/
├── package.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## Current Package

The project package is:

```txt
@bayybays/stacksone-sdk
```

This package represents the reusable SDK and integration layer of the StacksOne ecosystem.

The same repository also contains the frontend application used to demonstrate and interact with the protocol.

---

## Smart Contract Modules

StacksOne is designed around several Clarity contract modules.

### Core Contract

The core contract manages the main progression state.

Responsibilities:

- Store user XP
- Calculate level
- Route mission completion
- Handle badge claim logic
- Coordinate authorized module calls

Level formula:

```txt
level = (XP / 500) + 1
```

---

### Mission Contract

The mission contract handles activity validation.

Responsibilities:

- Daily check-in cooldown
- Mission completion tracking
- Duplicate claim prevention
- Authorized core-only write access

---

### Badge Contract

The badge contract handles NFT-based achievements.

Responsibilities:

- SIP-009 NFT badge minting
- Badge metadata URI
- Badge ownership validation
- Core-only mint authorization

---

### Token Contract

The token contract handles ecosystem token utility.

Responsibilities:

- SIP-010 compatible token behavior
- Transfer validation
- Owner-controlled minting
- Approved minter system
- Ecosystem reward utility

---

### Leaderboard Contract

The leaderboard contract tracks competitive engagement.

Responsibilities:

- Add user score
- Read user score
- Calculate rank tier
- Reset season when needed

Rank tiers:

| Tier | Score Requirement |
|---|---|
| 0 | Less than 100 |
| 1 | 100+ |
| 2 | 500+ |
| 3 | 1000+ |

---

### Reputation Module

The reputation module is used to extend user identity and trust scoring across the ecosystem.

Possible responsibilities:

- Reputation score tracking
- Activity-based trust signals
- Ecosystem profile enrichment
- Long-term identity scoring

---

### Boost Module

The boost module improves progression mechanics.

Responsibilities:

- XP lock simulation
- Boost multiplier storage
- Unlock logic
- Progression enhancement

---

### Engagement Modules

StacksOne includes lightweight engagement modules.

| Module | Purpose |
|---|---|
| Lucky Draw | On-chain roll counter |
| Duel Arena | Combat score counter |
| Prediction Room | Number prediction interaction |

---

## Contract List

Current StacksOne contract modules:

```txt
genesis-core-v10
genesis-missions-v10
genesis-badges-v10
token-one
reputation-engine
genesis-boost-v1
genesis-leaderboard-v1
genesis-lucky-v1
genesis-duel-v1
genesis-predict-v1
```

---

## Mainnet Deployment

Deployer address:

```txt
SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3
```

Mainnet modules:

```txt
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
```

---

## Contract Configuration Example

Example SDK contract configuration:

```js
const client = new StacksOneClient({
  network: 'mainnet',
  appDetails: {
    name: 'StacksOne App',
    icon: 'https://example.com/icon.png'
  },
  contracts: {
    core: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-core-v10',
    missions: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-missions-v10',
    badges: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-badges-v10',
    token: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.token-one',
    leaderboard: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-leaderboard-v1',
    boost: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-boost-v1'
  }
});
```

---

## Network Options

Supported network values:

```txt
mainnet
testnet
devnet
```

Example:

```js
const client = new StacksOneClient({
  network: 'mainnet'
});
```

---

## Environment Variables

Create a `.env` file if your frontend uses external services such as Supabase.

Example:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STACKS_NETWORK=mainnet
VITE_APP_NAME=StacksOne
VITE_APP_ICON_URL=
```

Do not commit real private keys or sensitive credentials.

For public setup reference, create:

```txt
.env.example
```

---

## Supabase Usage

Supabase may be used as an optional off-chain cache layer.

Possible use cases:

- Cached user profiles
- Leaderboard indexing
- Mission metadata
- Frontend performance optimization
- Off-chain analytics
- Community dashboard data

Important note:

```txt
On-chain state should remain the source of truth.
Supabase should only be used as a cache, index, or UX improvement layer.
```

---

## Development Workflow

Recommended workflow:

```txt
1. Update smart contract logic
2. Test with Clarinet
3. Update SDK contract helpers
4. Update frontend components
5. Run local frontend
6. Test wallet interaction
7. Build production version
8. Deploy frontend
9. Publish SDK if needed
```

---

## Smart Contract Testing

If the `smart-contracts` folder is included, run Clarinet tests:

```bash
cd smart-contracts
clarinet test
```

Or if scripts are configured:

```bash
npm run test
```

---

## Deployment Guide

Generate deployment plan:

```bash
clarinet deployments generate --mainnet --low-cost
```

Apply deployment:

```bash
clarinet deployments apply --mainnet
```

After deployment, configure authorized contracts from the admin wallet.

Example:

```clarity
(set-game-core 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-core-v10)
```

Contracts that may require core authorization:

```txt
genesis-badges-v10
genesis-missions-v10
```

---

## Security Model

StacksOne follows a dual-authorization model.

### Admin Authority

The admin can:

- Configure protocol modules
- Set core contract address
- Transfer admin authority
- Update contract routing
- Recover from incorrect module wiring

### Core Contract Authority

The core contract can:

- Route mission completions
- Trigger badge claims
- Update user progression
- Interact with authorized modules

This structure helps prevent protocol lockout and supports future upgrades.

---

## SDK API Roadmap

Planned SDK improvements:

- TypeScript support
- Strongly typed contract calls
- React hooks
- Wallet session helpers
- Mission helpers
- Badge helpers
- Leaderboard helpers
- Token helpers
- Contract deployment helpers
- Example integrations
- Full developer documentation

---

## Frontend Roadmap

Planned frontend improvements:

- Improved wallet onboarding
- User profile dashboard
- Mission board UI
- Badge gallery
- Leaderboard page
- Token utility page
- Activity history
- Mobile-first interface
- Better loading states
- Error handling and transaction feedback

---

## Documentation Roadmap

Planned documentation:

```txt
docs/
├── architecture.md
├── sdk-api.md
├── contracts.md
├── deployment.md
├── frontend.md
├── supabase.md
└── examples.md
```

---

## Example Developer Flow

Using StacksOne inside another app:

```js
import { StacksOneClient } from '@bayybays/stacksone-sdk';

const client = new StacksOneClient({
  network: 'mainnet'
});

async function loadUser(address) {
  const stats = await client.getUserStats(address);
  const score = await client.getLeaderboardScore(address);

  return {
    address,
    xp: stats.xp,
    level: stats.level,
    score
  };
}

loadUser('SP000000000000000000000000000000000000000')
  .then(console.log)
  .catch(console.error);
```

---

## Example Frontend Flow

```txt
User opens frontend
        ↓
Connects Stacks wallet
        ↓
Frontend reads user state through SDK helpers
        ↓
User completes mission
        ↓
Transaction is submitted to Stacks
        ↓
Frontend updates XP, level, badge status, and score
```

---

## Build

Build production frontend:

```bash
npm run build
```

Output folder:

```txt
dist/
```

Preview production build:

```bash
npm run preview
```

---

## Publishing SDK

Before publishing the SDK package, make sure package metadata is correct.

Recommended package fields:

```json
{
  "name": "@bayybays/stacksone-sdk",
  "version": "2.0.0",
  "description": "Fullstack SDK and integration layer for the StacksOne ecosystem.",
  "type": "module",
  "main": "index.js",
  "license": "MIT"
}
```

Publish:

```bash
npm publish --access public
```

If using scoped package publishing:

```bash
npm publish --access public
```

---

## Repository

```txt
https://github.com/bayyubenjamin/stacksone
```

---

## NPM Package

```txt
https://www.npmjs.com/package/@bayybays/stacksone-sdk
```

---

## Author

Developed by **Bayu Benjamin**

GitHub:

```txt
https://github.com/bayyubenjamin
```

---

## License

This project is licensed under the MIT License.

See the `LICENSE` file for more details.

---

## Status

StacksOne is under active development.

This repository acts as the main fullstack workspace for the StacksOne ecosystem, including frontend application code, SDK utilities, and smart contract integration logic.