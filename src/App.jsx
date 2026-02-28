import React, { useState, useEffect } from 'react';
import { showConnect, openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { uintCV, stringAsciiCV, PostConditionMode, callReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
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

const GAME_LUCKY = 'genesis-lucky-v1';
const GAME_DUEL = 'genesis-duel-v1';
const GAME_PREDICT = 'genesis-predict-v1';

const network = new StacksMainnet();

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [leaderboardScore, setLeaderboardScore] = useState(0);
  const [leaderboardTier, setLeaderboardTier] = useState(0);

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

  const connectWallet = () => {
    showConnect({
      userSession,
      appDetails: { name: 'Genesis Platform', icon: window.location.origin + '/vite.svg' }
    });
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      walletButton={
        !userData ?
          <button onClick={connectWallet}>CONNECT</button> :
          <button onClick={() => { userSession.signUserOut(); setUserData(null); }}>
            {userData.profile.stxAddress.mainnet.slice(0,5)}...
          </button>
      }
    >
      {activeTab === 'home' && <Home userData={userData} />}
      {activeTab === 'tasks' && <Tasks />}
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
            <button onClick={handleAddLeaderboardScore}>Add +10</button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
