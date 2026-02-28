import React, { useState, useEffect } from 'react';
import { showConnect, openContractCall } from '@stacks/connect'; 
import { StacksMainnet } from '@stacks/network';
import { uintCV, stringAsciiCV, PostConditionMode, callReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
import { supabase, userSession } from '../supabaseClient'; 
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Vault from './pages/Vault';
import Games from './pages/Games';
import Modules from './pages/Modules';

const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; 
const CONTRACT_NAME = 'genesis-core-v10';

const GAME_LUCKY = 'genesis-lucky-v1';
const GAME_DUEL = 'genesis-duel-v1';
const GAME_PREDICT = 'genesis-predict-v1';

/* ========================= */
/* NEW: LEADERBOARD CONTRACT */
/* ========================= */

const LEADERBOARD_CONTRACT = 'genesis-leaderboard-v1';

const network = new StacksMainnet();

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

  /* ========================= */
  /* NEW: LEADERBOARD STATE    */
  /* ========================= */

  const [leaderboardScore, setLeaderboardScore] = useState(0);
  const [leaderboardTier, setLeaderboardTier] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      if (userSession.isUserSignedIn()) {
        const user = userSession.loadUserData(); 
        setUserData(user);
        fetchUserProfile(user.profile.stxAddress.mainnet);
        fetchLeaderboard(user.profile.stxAddress.mainnet);
      } else if (userSession.isSignInPending()) {
        const user = await userSession.handlePendingSignIn();
        setUserData(user);
        fetchUserProfile(user.profile.stxAddress.mainnet);
        fetchLeaderboard(user.profile.stxAddress.mainnet);
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

  /* ========================= */
  /* NEW: FETCH LEADERBOARD    */
  /* ========================= */

  const fetchLeaderboard = async (walletAddress) => {
    try {
      const scoreResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT,
        functionName: 'get-score',
        functionArgs: [standardPrincipalCV(walletAddress)],
        network,
        senderAddress: walletAddress
      });

      const tierResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT,
        functionName: 'get-rank-tier',
        functionArgs: [standardPrincipalCV(walletAddress)],
        network,
        senderAddress: walletAddress
      });

      // @ts-ignore
      setLeaderboardScore(Number(scoreResult.value.data.score.value));
      // @ts-ignore
      setLeaderboardTier(Number(tierResult.value));

    } catch (err) {
      console.log("Leaderboard fetch error:", err);
    }
  };

  /* ========================= */
  /* NEW: ADD SCORE TX         */
  /* ========================= */

  const handleAddLeaderboardScore = async () => {
    if (!userData) return alert("Connect wallet first!");

    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: LEADERBOARD_CONTRACT,
      functionName: 'add-score',
      functionArgs: [uintCV(10)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => {
        fetchLeaderboard(userData.profile.stxAddress.mainnet);
      }
    });
  };

  const handleMintBadge = async (badgeType) => {
    if (!userData) return alert("Connect wallet first!");

    const badgeNameMap = {
      'genesis': 'genesis',
      'node': 'node',
      'guardian': 'guardian'
    };

    const rawBadgeName = badgeNameMap[badgeType] || badgeType;
    
    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-badge',
      functionArgs: [stringAsciiCV(rawBadgeName)], 
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => {
        setBadgesStatus(prev => ({ ...prev, [badgeType]: true }));
      },
    });
  };

  const handleCompleteMission = async (taskId) => {
    if (!userData) { alert("Connect wallet first!"); return false; }
    const task = MISSION_LIST.find(t => t.id === taskId);
    
    return new Promise((resolve) => {
      openContractCall({
        network,
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

  const handleCheckIn = async () => {
    if (!userData) return alert("Connect wallet first!");
    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'daily-check-in',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => {
        setHasCheckedIn(true);
        setUserXP(prev => prev + 20);
      },
    });
  };

  const handleRoll = async () => {
    if (!userData) return alert("Connect wallet first!");
    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: GAME_LUCKY,
      functionName: 'roll',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => handleAddLeaderboardScore()
    });
  };

  const handleFight = async () => {
    if (!userData) return alert("Connect wallet first!");
    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: GAME_DUEL,
      functionName: 'fight',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => handleAddLeaderboardScore()
    });
  };

  const handlePredict = async () => {
    if (!userData) return alert("Connect wallet first!");
    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: GAME_PREDICT,
      functionName: 'predict',
      functionArgs: [uintCV(7)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: () => handleAddLeaderboardScore()
    });
  };

  const connectWallet = () => {
    showConnect({ 
      userSession, 
      appDetails: {name: 'Genesis Platform', icon: window.location.origin + '/vite.svg'} 
    });
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      walletButton={
        !userData ? 
        <button onClick={connectWallet} className="bg-orange-500 px-4 py-2 rounded-lg font-bold text-xs transition-all">
          CONNECT WALLET
        </button> :
        <button onClick={() => { userSession.signUserOut(); setUserData(null); }} className="bg-slate-800 px-4 py-2 rounded-lg font-mono text-xs hover:bg-slate-700 transition-colors">
          {userData.profile.stxAddress.mainnet.slice(0,5)}...{userData.profile.stxAddress.mainnet.slice(-5)}
        </button>
      }
    >

      {activeTab === 'home' && (
        <Home 
          userData={userData} 
          userXP={userXP} 
          userLevel={userLevel} 
          badgesStatus={badgesStatus} 
          handleMint={handleMintBadge} 
          connectWallet={connectWallet}
        />
      )}
      
      {activeTab === 'tasks' && (
        <Tasks 
          initialTasks={MISSION_LIST} 
          handleTask={handleCompleteMission} 
        />
      )}

      {activeTab === 'vault' && <Vault userData={userData} />}
      
      {activeTab === 'profile' && (
        <Profile 
          userData={userData} 
          userXP={userXP} 
          userLevel={userLevel} 
          hasCheckedIn={hasCheckedIn} 
          handleCheckIn={handleCheckIn} 
          disconnectWallet={() => { userSession.signUserOut(); setUserData(null); }} 
        />
      )}
      {activeTab === 'modules' && (
  <Modules userData={userData} />
)}
      {activeTab === 'games' && (
        <div>
          <Games 
            handleRoll={handleRoll}
            handleFight={handleFight}
            handlePredict={handlePredict}
          />

          <div style={{marginTop: 30, padding: 20, border: '1px solid #333'}}>
            <h3>🏆 Genesis Leaderboard</h3>
            <p>Score: {leaderboardScore}</p>
            <p>Rank Tier: {leaderboardTier}</p>
            <button onClick={handleAddLeaderboardScore}>
              Add +10 Score
            </button>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default App;
