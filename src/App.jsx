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
      id: 31,
      name: "Write Documentation",
      desc: "Contribute to the Genesis wiki or technical documentation",
      reward: 80,
      icon: "✍️"
    },
    {
      id: 32,
      name: "Verify Contract Source",
      desc: "Verify your deployed Clarity contract on the Stacks Explorer",
      reward: 50,
      icon: "🔍"
    },
    {
      id: 33,
      name: "Create a Subnet",
      desc: "Initialize a custom Genesis subnet for high-speed transactions",
      reward: 150,
      icon: "🌐"
    },
    {
      id: 34,
      name: "Refer 5 Users",
      desc: "Successfully onboard 5 active users through your referral link",
      reward: 120,
      icon: "👨‍👩‍👧‍👦"
    },
    {
      id: 35,
      name: "Stake for 1 Year",
      desc: "Commit your assets to a long-term 12-month staking cycle",
      reward: 250,
      icon: "⏳"
    },
    {
      id: 36,
      name: "Join Developer AMA",
      desc: "Attend the monthly Genesis developer Q&A session on Discord",
      reward: 20,
      icon: "🎙️"
    },
    {
      id: 37,
      name: "Integrate API",
      desc: "Successfully connect an external API to your Genesis dApp",
      reward: 90,
      icon: "🔌"
    },
    {
      id: 38,
      name: "Audit a Contract",
      desc: "Submit a peer-review report for a community-submitted Clarity contract",
      reward: 180,
      icon: "🛡️"
    },
    {
      id: 39,
      name: "Host a Meetup",
      desc: "Organize a local or virtual meetup for Genesis community members",
      reward: 300,
      icon: "⛺"
    },
    {
      id: 40,
      name: "Genesis Master",
      desc: "Complete all previous 39 tasks to earn the Master Badge",
      reward: 500,
      icon: "👑"
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
