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
      id: 71,
      name: "Bitflow Integration",
      desc: "Complete a stablecoin swap using the Bitflow protocol integration",
      reward: 45,
      icon: "🌊"
    },
    {
      id: 72,
      name: "Security Audit Submission",
      desc: "Perform a manual review of a community Clarity contract for vulnerabilities",
      reward: 220,
      icon: "🛡️"
    },
    {
      id: 73,
      name: "Diamond NFT Staking",
      desc: "Stake your Diamond Identity NFT to earn Genesis governance tokens",
      reward: 110,
      icon: "🔒"
    },
    {
      id: 74,
      name: "Layer 2 Scaling Test",
      desc: "Perform 50 micro-transactions on a Stacks Subnet in under 1 minute",
      reward: 85,
      icon: "⚡"
    },
    {
      id: 75,
      name: "SIP Co-Author",
      desc: "Contribute as a co-author to a new Stacks Improvement Proposal",
      reward: 400,
      icon: "✍️"
    },
    {
      id: 76,
      name: "Emergency Withdrawal Test",
      desc: "Practice an emergency withdrawal from a Genesis vault on testnet",
      reward: 50,
      icon: "🚨"
    },
    {
      id: 77,
      name: "Bitcoin Header Verification",
      desc: "Verify a Bitcoin block header manually within the Genesis dApp",
      reward: 130,
      icon: "⛓️"
    },
    {
      id: 78,
      name: "Diamond Council Vote",
      desc: "Participate in the exclusive Diamond Tier council vote for treasury allocation",
      reward: 95,
      icon: "🏛️"
    },
    {
      id: 79,
      name: "Cross-chain Message",
      desc: "Send a cross-chain message from Stacks to Ethereum via Genesis Bridge",
      reward: 125,
      icon: "✉️"
    },
    {
      id: 80,
      name: "Genesis Architect",
      desc: "Build and document a full-stack dApp that uses Genesis as a backend",
      reward: 750,
      icon: "🏗️"
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
