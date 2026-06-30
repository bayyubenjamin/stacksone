import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
  PostConditionMode,
  stringAsciiCV,
  uintCV,
} from '@stacks/transactions';

import {
  MISSION_CATALOG,
  STACKSONE_MAINNET,
  StacksOneClient,
  getMission,
} from '../index.js';
import { userSession } from './supabaseClient';

import Layout from './components/Layout';
import Gaming from './pages/Gaming';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Vault from './pages/Vault';

const network = new StacksMainnet();
const protocol = STACKSONE_MAINNET;
const client = new StacksOneClient({
  network,
  userSession,
  appDetails: {
    name: 'StacksOne',
    icon: '/logo.png',
  },
});

function getMainnetAddress(userData) {
  return userData?.profile?.stxAddress?.mainnet ?? null;
}

function App() {
  const [userData, setUserData] = useState(null);
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  const refreshUserProfile = useCallback(async (wallet) => {
    if (!wallet) return;

    try {
      const profile = await client.getUserProfile(wallet);
      setUserXP(profile.xp);
      setUserLevel(profile.level);
    } catch (error) {
      console.error('Failed to refresh the on-chain user profile:', error);
    }
  }, []);

  const hydrateSession = useCallback(async () => {
    try {
      if (userSession.isSignInPending()) {
        await userSession.handlePendingSignIn();
      }

      if (!userSession.isUserSignedIn()) return;

      const user = userSession.loadUserData();
      const wallet = getMainnetAddress(user);

      setUserData(user);
      await refreshUserProfile(wallet);
    } catch (error) {
      console.error('Failed to restore the wallet session:', error);
    }
  }, [refreshUserProfile]);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const connectWallet = async () => {
    try {
      const user = await client.connectWallet();
      if (!user) return;

      const wallet = getMainnetAddress(user);
      setUserData(user);
      await refreshUserProfile(wallet);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setUserXP(0);
    setUserLevel(1);
  };

  const handleTask = async (taskId) => {
    const wallet = getMainnetAddress(userData);
    const mission = getMission(taskId);

    if (!wallet) {
      window.alert('Connect wallet first');
      return false;
    }

    if (!mission) {
      console.error(`Unknown mission id: ${taskId}`);
      return false;
    }

    return new Promise((resolve) => {
      Promise.resolve(
        openContractCall({
          network,
          contractAddress: protocol.deployer,
          contractName: protocol.contracts.core,
          functionName: 'complete-mission',
          functionArgs: [uintCV(mission.id), uintCV(mission.reward)],
          postConditionMode: PostConditionMode.Allow,
          onFinish: () => {
            // Wallet completion means the transaction was submitted, not confirmed.
            // Refresh later and let the blockchain remain the source of truth.
            window.setTimeout(() => refreshUserProfile(wallet), 20_000);
            resolve(true);
          },
          onCancel: () => resolve(false),
        }),
      ).catch((error) => {
        console.error('Mission transaction failed to open:', error);
        resolve(false);
      });
    });
  };

  const handleMint = async (badgeId) => {
    const wallet = getMainnetAddress(userData);

    if (!wallet) {
      window.alert('Connect wallet first');
      return false;
    }

    return new Promise((resolve) => {
      Promise.resolve(
        openContractCall({
          network,
          contractAddress: protocol.deployer,
          contractName: protocol.contracts.core,
          functionName: 'claim-badge',
          functionArgs: [stringAsciiCV(badgeId)],
          postConditionMode: PostConditionMode.Allow,
          onFinish: () => {
            window.setTimeout(() => refreshUserProfile(wallet), 20_000);
            resolve(true);
          },
          onCancel: () => resolve(false),
        }),
      ).catch((error) => {
        console.error('Badge transaction failed to open:', error);
        resolve(false);
      });
    });
  };

  return (
    <Layout
      walletButton={
        !userData ? (
          <button
            onClick={connectWallet}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            CONNECT
          </button>
        ) : (
          <button
            onClick={disconnectWallet}
            className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-mono"
          >
            {getMainnetAddress(userData)?.slice(0, 5)}...
          </button>
        )
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <Home
              userData={userData}
              userXP={userXP}
              userLevel={userLevel}
              handleMint={handleMint}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <Tasks
              initialTasks={MISSION_CATALOG}
              handleTask={handleTask}
            />
          }
        />
        <Route path="/vault" element={<Vault userData={userData} />} />
        <Route path="/profile" element={<Profile userData={userData} />} />
        <Route path="/gaming" element={<Gaming userData={userData} />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
