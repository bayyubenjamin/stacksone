import React from 'react';

const BadgeCard = ({ id, title, subtitle, reqText, isLocked, isMinted, onMint, colorClass, icon }) => {
  return (
    <div className={`relative group overflow-hidden rounded-2xl border transition-all duration-500 ${
      isLocked ? "border-slate-800 bg-slate-900/40 opacity-75 grayscale" : isMinted ? "border-green-500/30 bg-slate-900/80 shadow-2xl shadow-green-900/20" : `border-slate-700 bg-slate-900 hover:border-${colorClass} hover:shadow-2xl hover:shadow-${colorClass}/20`
    }`}>
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border border-white/10 ${isMinted ? "bg-green-500/10 text-green-400" : `bg-slate-800 text-slate-400 group-hover:text-${colorClass}`}`}>
            {isMinted ? "✓" : icon}
          </div>
          {isMinted && <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Owned</span>}
          {isLocked && <span className="bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Locked</span>}
        </div>
        <div className="mb-8 flex-1">
          <h3 className="text-xl font-bold mb-1 text-white">{title}</h3>
          <p className={`text-xs font-bold tracking-widest uppercase mb-3 text-indigo-400`}>{subtitle}</p>
          <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-3">{reqText}</p>
        </div>
        <button
          onClick={() => onMint(id)}
          disabled={isLocked || isMinted}
          className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            isMinted ? "bg-slate-800 text-slate-500 cursor-default border border-slate-700" : isLocked ? "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-transparent" : `bg-white text-black hover:bg-indigo-500 hover:text-white shadow-lg shadow-white/5`
          }`}
        >
          {isMinted ? "Badge Secured" : isLocked ? "Requirements Not Met" : "Mint Badge"}
        </button>
      </div>
    </div>
  );
};

const Home = ({ userData, userXP, userLevel, badgesStatus, handleMint, connectWallet }) => {
  const badges = [
    {
      id: 'genesis',
      title: "Genesis Pioneer",
      subtitle: "Phase 1 Access",
      reqText: "Awarded to early protocol adopters. Requires Level 1.",
      icon: "💠",
      colorClass: "indigo-500", 
      isLocked: !userData || userLevel < 1, 
      isMinted: badgesStatus?.genesis || false
    },
    {
      id: 'node',
      title: "Node Operator",
      subtitle: "Consistency Tier",
      reqText: "Requires Level 2 and 500 XP. Validate your commitment via protocol synchronization.",
      icon: "⚡",
      colorClass: "purple-500",
      isLocked: !userData || userLevel < 2 || userXP < 500,
      isMinted: badgesStatus?.node || false
    },
    {
      id: 'guardian',
      title: "Protocol Guardian",
      subtitle: "Elite Status",
      reqText: "Requires Level 5 and 2000 XP. The highest honor for users who have secured the genesis protocol.",
      icon: "🛡️",
      colorClass: "amber-500",
      isLocked: !userData || userLevel < 5 || userXP < 2000,
      isMinted: badgesStatus?.guardian || false
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {userData && (
          <>
            <div className="bg-slate-900/50 border border-indigo-500/30 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-indigo-400 text-[10px] font-bold uppercase mb-1">Your XP</p>
              <p className="text-xl font-mono text-white">{userXP}</p>
            </div>
            <div className="bg-slate-900/50 border border-purple-500/30 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-purple-400 text-[10px] font-bold uppercase mb-1">Your Level</p>
              <p className="text-xl font-mono text-white">{userLevel}</p>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {badges.map((badge) => (<BadgeCard key={badge.id} {...badge} onMint={handleMint} />))}
      </div>
    </div>
  );
};

export default Home;
