import React, { useState, useEffect } from 'react';
import { showConnect, openContractCall } from '@stacks/connect'; 
import { StacksMainnet } from '@stacks/network';
import { uintCV, stringAsciiCV, PostConditionMode } from '@stacks/transactions';
import { supabase, userSession } from './supabaseClient'; 
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Vault from './pages/Vault';

const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; 
const CONTRACT_NAME = 'genesis-core-v5'; // DISESUAIKAN KE V5

const MISSION_LIST = [
  { id: 1, name: "Credential Analysis", desc: "Verify protocol eligibility tier.", reward: 50, icon: "🛡️", completed: false },
  { id: 2, name: "Identity Verification", desc: "Authenticate on-chain DID.", reward: 100, icon: "🆔", completed: false },
  { id: 3, name: "Protocol Activation", desc: "Activate initial node state.", reward: 200, icon: "⚡", completed: false }
];

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [badgesStatus, setBadgesStatus] = useState({ genesis: false, node: false, guardian: false });

  useEffect(() => {
    const checkSession = async () => {
      if (userSession.isUserSignedIn()) {
        const user = userSession.loadUserData(); 
        setUserData(user);
        fetchUserProfile(user.profile.stxAddress.mainnet);
      } else if (userSession.isSignInPending()) {
        const user = await userSession.handlePendingSignIn();
        setUserData(user);
        fetchUserProfile(user.profile.stxAddress.mainnet);
      }
    };
    checkSession();
  }, []);

  const fetchUserProfile = async (walletAddress) => {
    try {
      let { data: user } = await supabase.from('users').select('*').eq('wallet_address', walletAddress).single();
      if (user) {
        setUserXP(user.xp || 0);
        setUserLevel(user.level || 1);
        if (user.last_checkin) {
          const lastCheck = new Date(user.last_checkin).toDateString();
          setHasCheckedIn(lastCheck === new Date().toDateString());
        }
      }
    } catch (error) { console.error("Error profile:", error); }
  };

  const handleCompleteMission = async (taskId) => {
    if (!userData) { alert("Connect wallet first!"); return false; }
    const task = MISSION_LIST.find(t => t.id === taskId);
    
    return new Promise((resolve) => {
      openContractCall({
        network: new StacksMainnet(), 
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-mission',
        functionArgs: [uintCV(Number(taskId)), uintCV(Number(task.reward))], 
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          setUserXP(prev => prev + task.reward);
          resolve(true);
        },
        onCancel: () => resolve(false)
      });
    });
  };

  // Fungsi handleCheckIn & handleMintBadge tetap sama seperti sebelumnya...

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      walletButton={
        !userData ? 
        <button onClick={() => showConnect({ userSession, appDetails: {name: 'Genesis'} })} className="bg-orange-500 px-4 py-2 rounded-lg font-bold text-xs">CONNECT WALLET</button> :
        <button onClick={() => { userSession.signUserOut(); setUserData(null); }} className="bg-slate-800 px-4 py-2 rounded-lg font-mono text-xs">
          {userData.profile.stxAddress.mainnet.slice(0,5)}...
        </button>
      }
    >
      {activeTab === 'home' && <Home userData={userData} userXP={userXP} userLevel={userLevel} badgesStatus={badgesStatus} handleMint={handleMintBadge}
      {activeTab === 'tasks' && <Tasks initialTasks={MISSION_LIST} handleTask={handleCompleteMission} />}
      {activeTab === 'vault' && <Vault userData={userData} />}
      {activeTab === 'profile' && <Profile userData={userData} userXP={userXP} userLevel={userLevel} hasCheckedIn={hasCheckedIn} handleCheckIn={() => {}} disconnectWallet={() => {}} />}
    </Layout>
  );
}

export default App;
