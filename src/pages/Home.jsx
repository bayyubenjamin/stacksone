import React from 'react';

const Home = ({ userData, userXP, hasMinted, handleMint, connectWallet }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-900 border border-slate-700 p-8 md:p-16 text-center md:text-left shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">Phase 1: Early Access</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Welcome to the <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-stx-accent to-purple-400">Genesis Platform</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-xl leading-relaxed">
            Secure your position in the ecosystem. Contribute to the protocol growth and establish your on-chain reputation early.
          </p>
          
          {!userData ? (
            <button onClick={connectWallet} className="bg-white text-black font-bold py-4 px-10 rounded-lg hover:bg-slate-200 transition shadow-xl shadow-white/5">
              Initialize Access
            </button>
          ) : (
            <div className="flex flex-wrap gap-4 items-center">
               <button 
                  onClick={handleMint}
                  disabled={hasMinted || userXP < 100}
                  className={`px-8 py-3 rounded-lg font-bold border transition-all ${
                    hasMinted 
                    ? "bg-green-500/10 border-green-500/50 text-green-400 cursor-default" 
                    : "bg-stx-accent text-white border-transparent hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                  }`}
               >
                  {hasMinted ? "✓ Access Granted" : "Claim Genesis Badge"}
               </button>
               {userXP < 100 && !hasMinted && (
                 <p className="text-xs text-slate-500">*Requires 100 Reputation Points</p>
               )}
            </div>
          )}
        </div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-stx-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
           <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Participants</h3>
           <p className="text-3xl font-mono text-white">845</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
           <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Network State</h3>
           <p className="text-xl font-mono text-green-400">Active</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
           <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Phase Ends In</h3>
           <p className="text-3xl font-mono text-white">12d : 04h</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
