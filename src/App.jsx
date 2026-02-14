import React, { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage, openContractCall } from '@stacks/connect';
import { uintCV, stringAsciiCV } from '@stacks/transactions'; 
import { supabase } from './supabaseClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';
const CONTRACT_CORE = 'genesis-core-v4';

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [badgesStatus, setBadgesStatus] = useState({ genesis: false, node: false, guardian: false });

  const [txStatus, setTxStatus] = useState({
    type: 'idle',
    message: '',
    txId: null
  });

  // Fungsi monitor dengan pengecekan detail kegagalan (abort)
  const monitorTransaction = async (txId, successCallback) => {
    handleTxStatus('pending', 'Waiting for block confirmation...', txId);

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tx/${txId}`);
        const data = await response.json();

        // 1. Cek jika Sukses
        if (data.tx_status === 'success') {
          handleTxStatus('success', 'Transaction confirmed successfully!', txId);
          if (successCallback) successCallback();
          return true;
        } 
        
        // 2. Cek jika Gagal (Aborted/Failed)
        if (data.tx_status === 'abort' || (data.tx_status && data.tx_status.includes('fail'))) {
          // Tangkap pesan error spesifik jika ada
          const errorMsg = data.status || data.error_code || 'Contract execution aborted';
          handleTxStatus('failed', `Failed: ${errorMsg}`, txId);
          return true;
        }

        return false; // Masih pending di mempool
      } catch (error) {
        console.error("Monitoring error:", error);
        return false;
      }
    };

    const interval = setInterval(async () => {
      const isFinished = await checkStatus();
      if (isFinished) clearInterval(interval);
    }, 10000); // Cek tiap 10 detik
  };

  const handleTxStatus = (type, message, txId = null) => {
    setTxStatus({ type, message, txId });
    if (type === 'success' || type === 'failed') {
      setTimeout(() => setTxStatus({ type: 'idle', message: '', txId: null }), 10000);
    }
  };

  // --- Kontrak Call Handlers ---
  const handleCheckIn = async () => {
    if (hasCheckedIn || !userData) return;
    handleTxStatus('pending', 'Initiating daily check-in...');
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS, contractName: CONTRACT_CORE, functionName: 'daily-check-in', functionArgs: [], 
      onFinish: (data) => {
        monitorTransaction(data.txId, () => {
          const newXP = userXP + 20;
          setUserXP(newXP); setHasCheckedIn(true);
          supabase.from('users').update({ xp: newXP, last_checkin: new Date().toISOString() }).eq('wallet_address', userData.profile.stxAddress.mainnet);
        });
      },
      onCancel: () => handleTxStatus('failed', 'Transaction cancelled')
    });
  };

  const handleTask = async (taskId) => {
    if (!userData) return;
    const task = [{id:1, reward:50}, {id:2, reward:50}, {id:3, reward:100}].find(t => t.id === taskId);
    handleTxStatus('pending', 'Submitting mission data...');
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS, contractName: CONTRACT_CORE, functionName: 'complete-mission',
      functionArgs: [uintCV(taskId), uintCV(task.reward)],
      onFinish: (data) => {
        monitorTransaction(data.txId, () => {
          const newXP = userXP + task.reward;
          const newCompleted = [...completedTaskIds, taskId];
          setUserXP(newXP); setCompletedTaskIds(newCompleted);
          supabase.from('users').update({ xp: newXP, completed_tasks: newCompleted }).eq('wallet_address', userData.profile.stxAddress.mainnet);
        });
      }
    });
  };

  const handleMint = async (badgeId) => {
    if (!userData || badgesStatus[badgeId]) return;
    handleTxStatus('pending', `Minting ${badgeId} badge...`);
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS, contractName: CONTRACT_CORE, functionName: 'claim-badge',
      functionArgs: [stringAsciiCV(badgeId)],
      onFinish: (data) => {
        monitorTransaction(data.txId, () => {
          const newBadges = { ...badgesStatus, [badgeId]: true };
          setBadgesStatus(newBadges);
          supabase.from('users').update({ badges: newBadges }).eq('wallet_address', userData.profile.stxAddress.mainnet);
        });
      }
    });
  };

  // --- Auth & Initial Load ---
  const fetchUserProfile = async (walletAddress) => {
    setLoading(true);
    let { data: user } = await supabase.from('users').select('*').eq('wallet_address', walletAddress).single();
    if (user) {
      setUserXP(user.xp || 0);
      setUserLevel(user.level || 1);
      setCompletedTaskIds(user.completed_tasks || []);
      setBadgesStatus(typeof user.badges === 'string' ? JSON.parse(user.badges) : user.badges || {});
      if (user.last_checkin) {
        setHasCheckedIn(new Date(user.last_checkin).toDateString() === new Date().toDateString());
      }
    }
    setLoading(false);
  };

  const connectWallet = async () => {
    await connect({
      appDetails: { name: 'Genesis Platform', icon: window.location.origin + '/vite.svg' },
      onFinish: (res) => {
        const addr = res.addresses.find(a => a.symbol === 'STX').address;
        setUserData({ profile: { stxAddress: { mainnet: addr } } });
        fetchUserProfile(addr);
      }
    });
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} txStatus={txStatus} walletButton={
      !userData ? <button onClick={connectWallet} className="bg-stx-accent px-4 py-2 rounded-lg font-bold text-xs">CONNECT</button> :
      <button onClick={() => { disconnect(); setUserData(null); }} className="bg-slate-800 px-4 py-2 rounded-lg font-mono text-xs">{userData.profile.stxAddress.mainnet.slice(0,5)}...</button>
    }>
      {loading ? <div className="p-10 text-center animate-pulse">Syncing...</div> :
       activeTab === 'home' ? <Home userData={userData} userXP={userXP} userLevel={userLevel} badgesStatus={badgesStatus} handleMint={handleMint} connectWallet={connectWallet} hasCheckedIn={hasCheckedIn} /> :
       activeTab === 'tasks' ? <Tasks tasks={[{id:1, name:"Ecosystem Access", reward:50, icon:"🌐", completed:completedTaskIds.includes(1)}, {id:2, name:"Identity Verification", reward:50, icon:"🛡️", completed:completedTaskIds.includes(2)}, {id:3, name:"Network Signal", reward:100, icon:"📡", completed:completedTaskIds.includes(3)}]} handleTask={handleTask} /> :
       <Profile userData={userData} userXP={userXP} userLevel={userLevel} hasCheckedIn={hasCheckedIn} handleCheckIn={handleCheckIn} disconnectWallet={() => { disconnect(); setUserData(null); }} />}
    </Layout>
  );
}

export default App;
