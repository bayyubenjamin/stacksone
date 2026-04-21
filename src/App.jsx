import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Tambahkan import dari react-router-dom
import { showConnect, openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
  uintCV,
  PostConditionMode,
  callReadOnlyFunction,
  standardPrincipalCV,
  tupleCV,
  cvToHex,
  hexToCV,
  cvToValue,
  stringAsciiCV
} from '@stacks/transactions';

import { supabase, userSession } from './supabaseClient';

import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Vault from './pages/Vault';
import Gaming from './pages/Gaming';

const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';
const CONTRACT_NAME = 'genesis-core-v10';
const LEADERBOARD_CONTRACT = 'genesis-leaderboard-v1';

const network = new StacksMainnet();

function App() {

  const [userData, setUserData] = useState(null);

  const [leaderboardScore, setLeaderboardScore] = useState(0);
  const [leaderboardTier, setLeaderboardTier] = useState(0);

  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  const [tasks] = useState([
    {
      id: 91,
      name: "Bitcoin Finality Check",
      desc: "Verify a transaction's settlement status on the Bitcoin blockchain",
      reward: 55,
      icon: "🏁"
    },
    {
      id: 92,
      name: "Identity Oracle Setup",
      desc: "Set up a decentralized oracle to feed off-chain data to your identity",
      reward: 180,
      icon: "🔮"
    },
    {
      id: 93,
      name: "Diamond Vault Creation",
      desc: "Create a time-locked vault for your most valuable digital assets",
      reward: 140,
      icon: "🔒"
    },
    {
      id: 94,
      name: "Clarity SDK Contribution",
      desc: "Submit a pull request to improve the Stacks/Clarity developer tools",
      reward: 350,
      icon: "🛠️"
    },
    {
      id: 95,
      name: "Cross-chain Arbitrage",
      desc: "Execute a successful trade between Stacks and another L2 chain",
      reward: 200,
      icon: "📈"
    },
    {
      id: 96,
      name: "Genesis Ambassador",
      desc: "Represent Genesis in an official Web3 conference or hackathon",
      reward: 500,
      icon: "👔"
    },
    {
      id: 97,
      name: "Metadata Optimization",
      desc: "Optimize your NFT metadata for faster loading on decentralized storage",
      reward: 65,
      icon: "📦"
    },
    {
      id: 98,
      name: "Diamond Governance Lead",
      desc: "Moderate a governance discussion and summarize the community consensus",
      reward: 150,
      icon: "🗣️"
    },
    {
      id: 99,
      name: "Project Whitepaper V2",
      desc: "Co-write the updated technical roadmap for AFA-Identity-Diamond",
      reward: 400,
      icon: "🗺️"
    },
    {
      id: 100,
      name: "The Genesis Ultimate",
      desc: "Achieve all 99 previous milestones to become a Genesis Legend",
      reward: 5000,
      icon: "🌌"
    }
  ]);

  useEffect(() => {

    if (userSession.isUserSignedIn()) {

      const user = userSession.loadUserData();
      const wallet = user.profile.stxAddress.mainnet;

      setUserData(user);

      fetchLeaderboard(wallet);
      fetchUserProfile(wallet);

    }

  }, []);

  const fetchUserProfile = async (wallet) => {

    try {

      const key = standardPrincipalCV(wallet);

      const response = await fetch(
        `${network.coreApiUrl}/v2/map_entry/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/user-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cvToHex(key))
        }
      );

      if (!response.ok) {
        setUserXP(0);
        setUserLevel(1);
        return;
      }

      const data = await response.json();
      const resultCV = hexToCV(data.data);
      const val = cvToValue(resultCV);

      let xp = 0;
      let level = 1;

      if (val && val.value) {
        xp = val.value.xp?.value !== undefined ? val.value.xp.value : (val.value.xp ?? 0);
        level = val.value.level?.value !== undefined ? val.value.level.value : (val.value.level ?? 1);
      } else if (val) {
        xp = val.xp?.value !== undefined ? val.xp.value : (val.xp ?? 0);
        level = val.level?.value !== undefined ? val.level.value : (val.level ?? 1);
      }

      setUserXP(Number(xp));
      setUserLevel(Number(level));

    } catch (err) {
      console.log("Profile fetch error:", err);
    }

  };

  const fetchLeaderboard = async (wallet) => {

    try {

      const scoreResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT,
        functionName: 'get-score',
        functionArgs: [standardPrincipalCV(wallet)],
        network,
        senderAddress: wallet
      });

      const tierResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT,
        functionName: 'get-rank-tier',
        functionArgs: [standardPrincipalCV(wallet)],
        network,
        senderAddress: wallet
      });

      const scoreValue = scoreResult?.value?.data?.score?.value ?? 0;
      const tierValue = tierResult?.value?.value ?? 0;

      setLeaderboardScore(Number(scoreValue));
      setLeaderboardTier(Number(tierValue));

    } catch (err) {
      console.log("Leaderboard error:", err);
    }

  };

  const handleAddLeaderboardScore = async () => {

    if (!userData) return;

    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: LEADERBOARD_CONTRACT,
      functionName: 'add-score',
      functionArgs: [uintCV(10)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => {
        fetchLeaderboard(userData.profile.stxAddress.mainnet);
        fetchUserProfile(userData.profile.stxAddress.mainnet);
      }
    });

  };

  const handleTask = async (taskId) => {

    if (!userData) {
      alert("Connect wallet first");
      return false;
    }

    const reward = tasks.find(t => t.id === taskId)?.reward ?? 0;

    return new Promise((resolve) => {
      openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-mission',
        functionArgs: [uintCV(taskId), uintCV(reward)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          const newXP = userXP + reward;
          setUserXP(newXP);
          setUserLevel(Math.floor(newXP / 500) + 1);
          setTimeout(() => fetchUserProfile(userData.profile.stxAddress.mainnet), 10000);
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });

  };

  const handleMint = async (badgeId) => {
    
    if (!userData) {
      alert("Connect wallet first");
      return false;
    }

    return new Promise((resolve) => {
      openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'claim-badge',
        functionArgs: [stringAsciiCV(badgeId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });

  };

  const connectWallet = () => {

    showConnect({
      userSession,
      appDetails: {
        name: 'Genesis Platform',
        icon: window.location.origin + '/vite.svg'
      }
    });

  };

  return (
    <Layout
      walletButton={
        !userData ?

          <button
            onClick={connectWallet}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            CONNECT
          </button>

          :

          <button
            onClick={() => {
              userSession.signUserOut();
              setUserData(null);
            }}
            className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-mono"
          >
            {userData.profile.stxAddress.mainnet.slice(0,5)}...
          </button>
      }
    >
      <Routes>
        {/* Redirect root (/) ke /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/home" element={
          <Home
            userData={userData}
            userXP={userXP}
            userLevel={userLevel}
            handleMint={handleMint}
          />
        } />
        
        <Route path="/tasks" element={
          <Tasks
            initialTasks={tasks}
            handleTask={handleTask}
          />
        } />
        
        <Route path="/vault" element={<Vault userData={userData} />} />
        
        <Route path="/profile" element={<Profile userData={userData} />} />

        {/* --- TAMBAHAN ROUTE GAMING DI SINI --- */}
        <Route path="/gaming" element={<Gaming userData={userData} />} />

      </Routes>
    </Layout>
  );
}

export default App;
// update 85 at Sel 31 Mar 2026 14:53:04 WIB
// update 26 at Sel 31 Mar 2026 17:03:08 WIB
// update 98 at Sel 31 Mar 2026 21:53:04 WIB
// update 146 at Rab 01 Apr 2026 01:18:54 WIB
// update 44 at Sab 04 Apr 2026 14:14:40 WIB
// update 70 at Sab 04 Apr 2026 17:24:33 WIB
// update 87 at Sab 04 Apr 2026 19:41:02 WIB
// update 90 at Sab 04 Apr 2026 20:04:10 WIB
// update 118 at Sab 04 Apr 2026 23:41:52 WIB
// update 27 at Min 05 Apr 2026 16:33:33 WIB
// update 32 at Min 05 Apr 2026 17:07:56 WIB
// update 79 at Min 05 Apr 2026 22:58:11 WIB
// update 107 at Sen 06 Apr 2026 02:16:48 WIB
// update 134 at Sen 06 Apr 2026 05:31:53 WIB
// update 138 at Sen 06 Apr 2026 06:07:09 WIB
// update 41 at Sen 06 Apr 2026 23:11:34 WIB
// update 66 at Sel 07 Apr 2026 02:19:42 WIB
// update 74 at Sel 07 Apr 2026 03:17:08 WIB
// update 37 at Rab 08 Apr 2026 15:17:46 WIB
// update 64 at Rab 08 Apr 2026 18:38:15 WIB
// update 68 at Rab 08 Apr 2026 19:07:48 WIB
// update 84 at Rab 08 Apr 2026 21:04:15 WIB
// update 105 at Rab 08 Apr 2026 23:37:42 WIB
// update 112 at Kam 09 Apr 2026 00:29:09 WIB
// update 123 at Kam 09 Apr 2026 01:54:42 WIB
// update 146 at Kam 09 Apr 2026 04:44:22 WIB
// update 25 at Jum 10 Apr 2026 14:20:47 WIB
// update 82 at Jum 10 Apr 2026 21:19:41 WIB
// update 16 at Sab 11 Apr 2026 16:07:33 WIB
// update 33 at Sab 11 Apr 2026 18:13:44 WIB
// update 4 at Min 12 Apr 2026 15:13:52 WIB
// update 12 at Min 12 Apr 2026 19:13:25 WIB
// update 4 at Sen 13 Apr 2026 09:29:10 WIB
// update 5 at Sen 13 Apr 2026 09:34:21 WIB
// update 57 at Sen 13 Apr 2026 14:44:03 WIB
// update 72 at Sen 13 Apr 2026 16:20:26 WIB
// update 45 at Sel 14 Apr 2026 12:48:21 WIB
// update 2 at Rab 15 Apr 2026 08:59:19 WIB
// update 26 at Rab 15 Apr 2026 11:21:55 WIB
// update 5 at Rab 15 Apr 2026 23:28:09 WIB
// update 23 at Kam 16 Apr 2026 01:16:36 WIB
// update 28 at Kam 16 Apr 2026 01:46:46 WIB
// update 66 at Kam 16 Apr 2026 05:36:20 WIB
// update 125 at Kam 16 Apr 2026 11:37:13 WIB
// update 126 at Kam 16 Apr 2026 11:41:45 WIB
// update 39 at Kam 16 Apr 2026 22:22:16 WIB
// update 42 at Kam 16 Apr 2026 22:38:23 WIB
// update 88 at Jum 17 Apr 2026 03:05:06 WIB
// update 1 at Jum 17 Apr 2026 11:22:24 WIB
// update 18 at Sab 18 Apr 2026 11:31:04 WIB
// update 27 at Sab 18 Apr 2026 12:25:48 WIB
// update 64 at Sab 18 Apr 2026 16:32:28 WIB
// update 199 at Min 19 Apr 2026 07:00:33 WIB
// update 214 at Min 19 Apr 2026 08:38:58 WIB
// update 218 at Min 19 Apr 2026 09:03:52 WIB
// update 230 at Min 19 Apr 2026 10:17:20 WIB
// update 231 at Min 19 Apr 2026 10:25:01 WIB
// update 234 at Min 19 Apr 2026 10:41:57 WIB
// update 235 at Min 19 Apr 2026 10:48:34 WIB
// update 250 at Min 19 Apr 2026 12:21:09 WIB
// update 23 at Min 19 Apr 2026 18:53:15 WIB
// update 59 at Min 19 Apr 2026 22:58:28 WIB
// update 70 at Sen 20 Apr 2026 00:11:22 WIB
// update 91 at Sen 20 Apr 2026 02:29:18 WIB
// update 135 at Sen 20 Apr 2026 07:02:56 WIB
// update 45 at Sen 20 Apr 2026 19:30:46 WIB
// update 72 at Sen 20 Apr 2026 22:35:37 WIB
// update 126 at Sel 21 Apr 2026 04:09:25 WIB
// update 142 at Sel 21 Apr 2026 05:49:15 WIB
// update 181 at Sel 21 Apr 2026 10:04:46 WIB
// update 13 at Sel 21 Apr 2026 14:56:18 WIB
// update 31 at Sel 21 Apr 2026 16:47:45 WIB
