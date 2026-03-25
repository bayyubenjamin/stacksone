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
      id: 21,
      name: "Mint sBTC",
      desc: "Deposit BTC to securely mint sBTC on the Stacks layer",
      reward: 75,
      icon: "₿"
    },
    {
      id: 22,
      name: "Deploy Clarity Contract",
      desc: "Write and deploy your first Clarity smart contract on testnet",
      reward: 100,
      icon: "📜"
    },
    {
      id: 23,
      name: "Claim Diamond Identity",
      desc: "Upgrade your on-chain profile to the exclusive Diamond tier",
      reward: 150,
      icon: "💎"
    },
    {
      id: 24,
      name: "Delegate STX (Stacking)",
      desc: "Lock your STX by delegating to a trusted pool to earn Bitcoin yields",
      reward: 80,
      icon: "🥞"
    },
    {
      id: 25,
      name: "Buy Genesis NFT",
      desc: "Purchase a verified Genesis collection NFT from the secondary marketplace",
      reward: 50,
      icon: "🛍️"
    },
    {
      id: 26,
      name: "Join Bug Bounty",
      desc: "Find and report a valid bug in the protocol's GitHub repository",
      reward: 300,
      icon: "🐛"
    },
    {
      id: 27,
      name: "Write a Thread",
      desc: "Create an X (Twitter) thread explaining how the Genesis ecosystem works",
      reward: 35,
      icon: "✍️"
    },
    {
      id: 28,
      name: "Run a Local Node",
      desc: "Set up and run a local node to support network decentralization",
      reward: 200,
      icon: "🖥️"
    },
    {
      id: 29,
      name: "Create DAO Proposal",
      desc: "Draft and submit a formal governance proposal for the community to vote on",
      reward: 120,
      icon: "📝"
    },
    {
      id: 30,
      name: "Complete KYC Verification",
      desc: "Verify your decentralized identity to unlock advanced protocol features",
      reward: 45,
      icon: "🛡️"
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
