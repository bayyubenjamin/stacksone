import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { supabase } from './supabaseClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);

  // --- STATE DATABASE ---
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [hasMinted, setHasMinted] = useState(false);

  // Misi dengan Narasi Profesional
  const allTasks = [
    { id: 1, name: "Ecosystem Access", desc: "Connect with the official protocol channels.", reward: 50, icon: "🌐" },
    { id: 2, name: "Identity Verification", desc: "Verify your status in our secure server.", reward: 50, icon: "🛡️" },
    { id: 3, name: "Network Signal", desc: "Amplify the genesis announcement.", reward: 100, icon: "📡" },
  ];

  const tasksWithStatus = allTasks.map(task => ({
    ...task,
    completed: completedTaskIds.includes(task.id)
  }));

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setUserData(data);
      fetchUserProfile(data.profile.stxAddress.mainnet);
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data);
        fetchUserProfile(data.profile.stxAddress.mainnet);
      });
    }
  }, []);

  // --- SUPABASE LOGIC (Sesuai Tabel Users) ---
  const fetchUserProfile = async (walletAddress) => {
    setLoading(true);
    
    // 1. Cek User di Database
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    // 2. Jika User Baru -> Buat Record
    if (error && error.code === 'PGRST116') {
      console.log("Initializing new genesis user...");
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
            wallet_address: walletAddress, 
            xp: 0, 
            level: 1,
            completed_tasks: [] 
        }])
        .select()
        .single();
      
      if (createError) console.error("Registration failed:", createError);
      else user = newUser;
    }

    // 3. Set State Lokal
    if (user) {
      setUserXP(user.xp || 0);
      setUserLevel(user.level || 1);
      setCompletedTaskIds(user.completed_tasks || []);
      
      // Cek Check-in Harian
      if (user.last_checkin) {
        const lastDate = new Date(user.last_checkin).toDateString();
        const today = new Date().toDateString();
        setHasCheckedIn(lastDate === today);
      } else {
        setHasCheckedIn(false);
      }
    }
    setLoading(false);
  };

  const updateDatabase = async (updates) => {
    if (!userData) return;
    const address = userData.profile.stxAddress.mainnet;
    await supabase.from('users').update(updates).eq('wallet_address', address);
  };

  const calculateLevel = (currentXP) => Math.floor(currentXP / 500) + 1;

  // --- ACTIONS ---
  const connectWallet = () => {
    showConnect({
      appDetails: { 
        name: 'Genesis Platform', 
        icon: window.location.origin + '/vite.svg' 
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
        fetchUserProfile(data.profile.stxAddress.mainnet);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut("/");
    setUserData(null);
    setUserXP(0);
    setUserLevel(1);
    setCompletedTaskIds([]);
  };

  const handleCheckIn = async () => {
    if (hasCheckedIn || !userData) return;
    
    const newXP = userXP + 20;
    const newLevel = calculateLevel(newXP);

    // Optimistic Update
    setUserXP(newXP);
    setUserLevel(newLevel);
    setHasCheckedIn(true);

    // Kirim ke Backend
    await updateDatabase({
      xp: newXP,
      level: newLevel,
      last_checkin: new Date().toISOString()
    });
  };

  const handleTask = async (taskId) => {
    if (!userData) return;
    const task = allTasks.find(t => t.id === taskId);
    if (!task || completedTaskIds.includes(taskId)) return;

    const newXP = userXP + task.reward;
    const newLevel = calculateLevel(newXP);
    const newCompleted = [...completedTaskIds, taskId];
    
    setUserXP(newXP);
    setUserLevel(newLevel);
    setCompletedTaskIds(newCompleted);

    await updateDatabase({
      xp: newXP,
      level: newLevel,
      completed_tasks: newCompleted
    });
  };

  const handleMint = () => {
    if (!userData) return alert("Wallet connection required.");
    setHasMinted(true);
    alert("Smart contract interaction initiated.");
  };

  // --- RENDER ---
  const renderContent = () => {
    if (loading) return <div className="flex h-full items-center justify-center text-stx-accent font-mono animate-pulse">Synchronizing Node...</div>;

    switch (activeTab) {
      case 'home':
        return <Home userData={userData} userXP={userXP} hasMinted={hasMinted} handleMint={handleMint} connectWallet={connectWallet} />;
      case 'tasks':
        return <Tasks tasks={tasksWithStatus} handleTask={handleTask} />;
      case 'profile':
        return <Profile userData={userData} userXP={userXP} userLevel={userLevel} hasCheckedIn={hasCheckedIn} handleCheckIn={handleCheckIn} disconnectWallet={disconnectWallet} />;
      default:
        return <Home />;
    }
  };

  const WalletButton = !userData ? (
    <button onClick={connectWallet} className="bg-stx-accent hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/20">
      CONNECT STACKS
    </button>
  ) : (
    <button onClick={disconnectWallet} className="border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 text-xs font-mono px-4 py-2 rounded-lg transition">
      {userData.profile.stxAddress.mainnet.slice(0,4)}...{userData.profile.stxAddress.mainnet.slice(-4)}
    </button>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} walletButton={WalletButton}>
      {renderContent()}
    </Layout>
  );
}

export default App;
