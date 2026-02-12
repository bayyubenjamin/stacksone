import React from 'react';

const Profile = ({ userData, userXP, userLevel, hasCheckedIn, handleCheckIn, disconnectWallet }) => {
  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
        <div className="text-4xl mb-4 opacity-50">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Restricted Area</h2>
        <p className="text-slate-500 text-sm">Authentication required to view identity.</p>
      </div>
    );
  }

  const nextLevelXP = userLevel * 500;
  const progress = (userXP / nextLevelXP) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Identity Card */}
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative z-10">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-slate-600 bg-slate-900">
                <img 
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${userData.profile.stxAddress.mainnet}`} 
                    alt="avatar" 
                    className="w-full h-full rounded-full"
                />
            </div>
        </div>
        
        <div className="text-center md:text-left flex-1 relative z-10">
           <h2 className="text-2xl font-bold text-white">Early Adopter</h2>
           <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className="text-slate-400 font-mono text-xs bg-black/30 px-3 py-1 rounded border border-slate-700">
                    {userData.profile.stxAddress.mainnet}
                </span>
           </div>
        </div>

        <div className="relative z-10">
             <button 
                onClick={disconnectWallet}
                className="text-red-400 text-xs font-bold hover:text-red-300 transition"
             >
                DISCONNECT
             </button>
        </div>
        
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-blue-900/10 to-transparent"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl">
           <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2">Access Level</p>
           <p className="text-4xl font-bold text-white">{userLevel}</p>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl">
           <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2">Reputation Points</p>
           <p className="text-4xl font-bold text-stx-accent">{userXP}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[#0F172A] p-6 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs mb-3">
           <span className="text-slate-400 font-bold uppercase tracking-wide">Next Tier Progress</span>
           <span className="text-slate-300 font-mono">{userXP} / {nextLevelXP} PTS</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
           <div 
             className="bg-stx-accent h-full transition-all duration-500"
             style={{ width: `${Math.min(progress, 100)}%` }}
           ></div>
        </div>
      </div>

      {/* Daily Sync */}
      <div className="relative group overflow-hidden bg-slate-900 p-1 rounded-xl border border-slate-700">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>
         <div className="relative bg-[#0B1120] p-6 rounded-lg flex items-center justify-between">
            <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">Daily Synchronization</h3>
                <p className="text-slate-500 text-xs mt-1">Sync your node daily to maintain streak.</p>
            </div>
            <button 
            onClick={handleCheckIn}
            disabled={hasCheckedIn}
            className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                hasCheckedIn 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-stx-accent text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
            }`}
            >
            {hasCheckedIn ? "Synced" : "Sync Now (+20)"}
            </button>
         </div>
      </div>
    </div>
  );
};

export default Profile;
