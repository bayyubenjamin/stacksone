# Genesis One | Stacks Ecosystem Interface

**Genesis One** is a decentralized application (dApp) built on the Stacks blockchain designed to gamify user onboarding and identity verification. The platform integrates secure wallet authentication, an XP-based progression system, and on-chain interaction tasks, powered by a reactive frontend and a Supabase backend.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Key Features

### 🔐 Secure Authentication & Identity
- **Stacks Wallet Integration:** Seamless connection using `@stacks/connect` (supporting Leather, Xverse, and other SIP-18 wallets).
- **Identity Persistence:** User profiles are automatically synced between the blockchain wallet and the Supabase database.

### 🎮 Gamified Progression System
- **XP & Leveling:** Users earn Experience Points (XP) to increase their "Security Level" within the platform.
- **Daily Check-ins:** Recurring rewards for active daily participation.
- **Real-time Updates:** Immediate UI feedback for level-ups and reward claims.

### 📋 Mission Control
- **Task Tracking:** Interactive mission list (e.g., Ecosystem Access, Network Signal).
- **State Management:** Tracks completed tasks prevents duplicate rewards, and persists progress across sessions.

### ⚡ Modern UI/UX
- **Responsive Dashboard:** Built with **Tailwind CSS** for a futuristic, "Cyber/Dark Mode" aesthetic.
- **Performance:** Powered by **Vite** for lightning-fast HMR and build times.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS
- **Blockchain:** Stacks.js (Connect, Network)
- **Backend/Database:** Supabase
- **Polyfills:** Custom buffer/global polyfills for Web3 compatibility

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Stacks Wallet extension (Leather or Xverse) installed in your browser.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stacks-tool
Install Dependencies

Bash

npm install
Environment Setup
Create a .env file in the root directory and add your Supabase credentials:

Cuplikan kode

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the Development Server

Bash

npm run dev
📂 Project Structure
Plaintext

src/
├── components/      # UI Components (Layout, Sidebar, etc.)
├── pages/           # Main Views (Home, Tasks, Profile)
├── assets/          # Static assets
├── polyfills.js     # Buffer & Global polyfills for Stacks.js
├── supabaseClient.js # Supabase configuration
├── App.jsx          # Main Logic & State Management
└── main.jsx         # Entry point
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request
