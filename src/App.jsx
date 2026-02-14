import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { supabase } from './supabaseClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

// Konfigurasi App & Session (Pindahkan ke luar komponen agar statis)
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

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

  // Cek sesi login saat komponen dimuat
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      console.log("User sudah login, memuat data...");
      const user = userSession.loadUserData();
      setUserData(user);
      fetchUserProfile(user.profile.stxAddress.mainnet);
    } else {
      console.log("User belum login.");
    }
  }, []);

  const monitorTransaction = async (txId, successCallback) => {
    handleTxStatus('pending', 'Waiting for block confirmation...', txId);

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tx/${txId}`);
        const data = await response.json();

        if (data.tx_status === 'success') {
          handleTxStatus('success', 'Transaction confirmed successfully!', txId);
          if (successCallback) successCallback();
          return true;
        } 
        
        if (data.tx_status === 'abort' || (data.tx_status && data.tx_status.includes('fail'))) {
          const errorMsg = data.status || data.error_code || 'Contract execution aborted';
          handleTxStatus('failed', `Failed: ${errorMsg}`, txId);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Monitoring error:", error);
        return false;
      }
    };

    const interval = setInterval(async () => {
      const isFinished = await checkStatus();
      if (isFinished) clearInterval(interval);
    }, 10000);
  };

  const handleTxStatus = (type, message, txId = null) => {
    setTxStatus({ type, message, txId });
    if (type === 'success' || type === 'failed') {
      setTimeout(() => setTxStatus({ type: 'idle', message: '', txId: null }), 10000);
    }
  };

  const connectWallet = () => {
    console.log("Tombol Connect ditekan..."); // Debugging
    try {
      showConnect({
        appDetails: {
          name: 'Genesis Platform',
          icon: window.location.origin + '/vite.svg',
        },
        redirectTo: '/',
        onFinish: () => {
          console.log("Koneksi berhasil!");
          const user = userSession.loadUserData();
          setUserData(user);
          fetchUserProfile(user.profile.stxAddress.mainnet);
        },
        userSession,
      });
    } catch (err) {
      console.error("Error saat connect wallet:", err);
      alert("Gagal memuka wallet popup. Cek console browser.");
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setUserXP(0); // Reset state lokal
    setHasCheckedIn(false);
  };

  const fetchUserProfile = async (walletAddress) => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error profile fetch:", error);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (hasCheckedIn || !userData) return;
    handleTxStatus('pending', 'Initiating daily check-in...');
    
    try {
      showConnect({
        appDetails: { name: 'Genesis Platform', icon: window.location.origin + '/vite.svg' },
        userSession,
        finished: (data) => {
          monitorTransaction(data.txId, () => {
            const newXP = userXP + 20;
            setUserXP(newXP); setHasCheckedIn(true);
            supabase.from('users').update({ xp: newXP, last_checkin: new Date().toISOString() }).eq('wallet_address', userData.profile.stxAddress.mainnet);
          });
        }
      });
    } catch (e) {
      console.error("Error check-in:", e);
      handleTxStatus('failed', 'Gagal memulai transaksi');
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      walletButton={
        !userData ? 
        <button 
          onClick={connectWallet} 
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer relative z-50"
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
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-8 h-8 border-4 border-stx-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Syncing profile...</p>
        </div>
      ) : (
        <>
          {/* Debug Info Sementara */}
          <div className="hidden">{JSON.stringify(txStatus)}</div>
          
          {activeTab === 'home' ? (
            <Home 
              userData={userData} 
              userXP={userXP} 
              userLevel={userLevel} 
              badgesStatus={badgesStatus} 
              handleMint={(id) => console.log('Mint', id)} 
              connectWallet={connectWallet} 
              hasCheckedIn={hasCheckedIn} 
            />
          ) : activeTab === 'tasks' ? (
            <Tasks 
              tasks={[]} 
              handleTask={(id) => console.log('Task', id)} 
            />
          ) : (
            <Profile 
              userData={userData} 
              userXP={userXP} 
              userLevel={userLevel} 
              hasCheckedIn={hasCheckedIn} 
              handleCheckIn={handleCheckIn} 
              disconnectWallet={disconnectWallet} 
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
