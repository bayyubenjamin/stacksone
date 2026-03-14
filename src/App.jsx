import React, { useState, useEffect } from 'react';
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
  stringAsciiCV // Tambahan import untuk claim-badge
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
  const [activeTab, setActiveTab] = useState('home');

  const [leaderboardScore, setLeaderboardScore] = useState(0);
  const [leaderboardTier, setLeaderboardTier] = useState(0);

  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  const [tasks] = useState([
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
    },
    {
      id: 5,
      name: "Execute Smart Contract",
      desc: "Submit a transaction to interact with the Genesis protocol",
      reward: 30,
      icon: "⚙️"
    },
    {
      id: 6,
      name: "Earn XP Milestone",
      desc: "Reach a new XP milestone within the Genesis ecosystem",
      reward: 40,
      icon: "🚀"
    },
    {
      id: 7,
      name: "Claim Genesis Badge",
      desc: "Unlock and mint your first Genesis badge on-chain",
      reward: 50,
      icon: "🏅"
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

      // Perbaikan Ekstraksi Data: Handle Optional Stacks format
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
          // Optimistic UI Update agar State terasa Realtime
          const newXP = userXP + reward;
          setUserXP(newXP);
          // Rumus level dari contract: (+ (/ xp u500) u1)
          setUserLevel(Math.floor(newXP / 500) + 1);
          
          // Sinkronisasi background (opsional)
          setTimeout(() => fetchUserProfile(userData.profile.stxAddress.mainnet), 10000);
          
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });

  };

  // Perbaikan: Integrasikan fungsi mint dengan Smart Contract claim-badge
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
        functionName: 'claim-badge', // Sesuai dengan smart contract
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

      {activeTab === 'home' && (
        <Home
          userData={userData}
          userXP={userXP}
          userLevel={userLevel}
          handleMint={handleMint}
        />
      )}

      {activeTab === 'tasks' && (
        <Tasks
          initialTasks={tasks}
          handleTask={handleTask}
        />
      )}

      {activeTab === 'vault' && <Vault userData={userData} />}

      {activeTab === 'profile' && <Profile userData={userData} />}

    </Layout>

  );

}

export default App;

import React from 'react';

const Layout = ({ children, activeTab, setActiveTab, walletButton }) => {

  const menuItems = [
    { id: 'home', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Protocol', icon: '💠' },
    { id: 'vault', label: 'Vault', icon: '🏦' }, 
    { id: 'profile', label: 'Identity', icon: '🆔' }
  ];

  return (
    <div className="min-h-screen flex bg-[#0B1120] text-slate-200 font-sans overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-[#0F172A]/95 backdrop-blur-xl z-20">

        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-stx-accent rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            G
          </div>

          <span className="font-bold tracking-tight text-lg text-white">
            GENESIS <span className="text-stx-accent">ONE</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-slate-800 text-white border-l-2 border-stx-accent'
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

      </aside>


      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col relative overflow-y-auto h-screen">

        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">

          <div className="hidden md:block text-slate-500 text-xs uppercase tracking-widest font-semibold">
            Secure Environment • Modular On-Chain Engine
          </div>

          <div>
            {walletButton}
          </div>

        </header>


        {/* PAGE CONTENT */}
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full pb-24 md:pb-10">
          {children}
        </div>

      </main>


      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 flex justify-around py-2 z-30">

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center text-xs font-medium ${
              activeTab === item.id
                ? 'text-stx-accent'
                : 'text-slate-500'
            }`}
          >

            <span className="text-lg">{item.icon}</span>

            {item.label}

          </button>
        ))}

      </div>

    </div>
  );
};

export default Layout;
