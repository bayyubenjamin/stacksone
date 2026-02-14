import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { supabase } from './supabaseClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

// 1. Konfigurasi Standar Stacks
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  
  // State User
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [badgesStatus, setBadgesStatus] = useState({ genesis: false, node: false, guardian: false });

  // Cek login saat load
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const user = userSession.loadUserData();
      setUserData(user);
      fetchUserProfile(user.profile.stxAddress.mainnet);
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((user) => {
        setUserData(user);
        fetchUserProfile(user.profile.stxAddress.mainnet);
      });
    }
  }, []);

  // 2. Fungsi Connect Wallet Standar
  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Genesis Platform',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        const user = userSession.loadUserData();
        setUserData(user);
        fetchUserProfile(user.profile.stxAddress.mainnet);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setUserXP(0);
  };

  const fetchUserProfile = async (walletAddress) => {
    setLoading(true);
    try {
      let { data: user } = await supabase.from('users').select('*').eq('wallet_address', walletAddress).single();
      if (user) {
        setUserXP(user.xp || 0);
        setUserLevel(user.level || 1);
        if (user.last_checkin) {
          setHasCheckedIn(new Date(user.last_checkin).toDateString() === new Date().toDateString());
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (hasCheckedIn || !userData) return;
    // Logika checkin sementara
    alert("Check-in triggered (Transaction logic here)");
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      walletButton={
        !userData ? 
        <button 
          onClick={connectWallet} 
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer"
        >
          CONNECT WALLET
        </button> :
        <button 
          onClick={disconnectWallet} 
          className="bg-slate-800 px-4 py-2 rounded-lg font-mono text-xs hover:bg-slate-700 transition-colors"
        >
          {userData.profile.stxAddress.mainnet.slice(0,5)}...
        </button>
      }
    >
      {loading ? (
        <div className="p-10 text-center animate-pulse text-slate-400">Loading profile...</div>
      ) : (
        <>
          {activeTab === 'home' && <Home userData={userData} userXP={userXP} userLevel={userLevel} badgesStatus={badgesStatus} connectWallet={connectWallet} hasCheckedIn={hasCheckedIn} />}
          {activeTab === 'tasks' && <Tasks tasks={[]} handleTask={(id) => console.log(id)} />}
          {activeTab === 'profile' && <Profile userData={userData} userXP={userXP} userLevel={userLevel} hasCheckedIn={hasCheckedIn} handleCheckIn={handleCheckIn} disconnectWallet={disconnectWallet} />}
        </>
      )}
    </Layout>
  );
}

export default App;
