import React, { useState, useEffect } from 'react';
import { showConnect, openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { uintCV, PostConditionMode, callReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
import { supabase, userSession } from './supabaseClient';

import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Vault from './pages/Vault';
import Games from './pages/Games';
import Modules from './pages/Modules';

const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';
const CONTRACT_NAME = 'genesis-core-v10';
const LEADERBOARD_CONTRACT = 'genesis-leaderboard-v1';

const network = new StacksMainnet();

function App() {

  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const [leaderboardScore, setLeaderboardScore] = useState(0);
  const [leaderboardTier, setLeaderboardTier] = useState(0);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Connect Wallet",
      desc: "Connect your Stacks wallet",
      reward: 10,
      icon: "🔗"
    },
    {
      id: 2,
      name: "Submit Transaction",
      desc: "Execute first protocol interaction",
      reward: 20,
      icon: "⚡"
    },
    {
      id: 3,
      name: "Explore Modules",
      desc: "Open and explore Genesis modules",
      reward: 15,
      icon: "🧪"
    },
    {
      id: 4,
      name: "Play Games",
      desc: "Launch a Genesis on-chain game",
      reward: 25,
      icon: "🎮"
    }
  ]);

  useEffect(() => {

    if (userSession.isUserSignedIn()) {
      const user = userSession.loadUserData();
      setUserData(user);
      fetchLeaderboard(user.profile.stxAddress.mainnet);
    }

  }, []);

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
      onFinish: () => fetchLeaderboard(userData.profile.stxAddress.mainnet)
    });

  };

  const handleTask = async (taskId) => {

    if (!userData) {
      alert("Connect wallet first");
      return false;
    }

    try {

      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-task',
        functionArgs: [uintCV(taskId)],
        postConditionMode: PostConditionMode.Allow
      });

      return true;

    } catch (err) {

      console.log("Task tx error:", err);
      return false;

    }

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
      activeTab={activeTab}
      setActiveTab={setActiveTab}
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

      {activeTab === 'home' && <Home userData={userData} />}

      {activeTab === 'tasks' && (
        <Tasks
          initialTasks={tasks}
          handleTask={handleTask}
        />
      )}

      {activeTab === 'vault' && <Vault userData={userData} />}

      {activeTab === 'profile' && <Profile userData={userData} />}

      {activeTab === 'modules' && <Modules userData={userData} />}

      {activeTab === 'games' && (

        <div>

          <Games />

          <div style={{ marginTop: 30 }}>

            <h3>🏆 Leaderboard</h3>

            <p>Score: {leaderboardScore}</p>

            <p>Tier: {leaderboardTier}</p>

            <button
              onClick={handleAddLeaderboardScore}
              className="mt-2 bg-indigo-500 px-4 py-2 rounded-lg text-sm font-bold"
            >
              Add +10
            </button>

          </div>

        </div>

      )}

    </Layout>

  );

}

export default App;
