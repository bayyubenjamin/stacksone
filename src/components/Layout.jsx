import React from 'react';

const Layout = ({ children, activeTab, setActiveTab, walletButton, txStatus }) => {
  const menuItems = [
    { id: 'home', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Protocol', icon: '💠' },
    { id: 'profile', label: 'Identity', icon: '🆔' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 flex relative overflow-hidden">
      
      {/* IMPROVED STATUS TOAST */}
      {txStatus && txStatus.type !== 'idle' && (
        <div className="fixed bottom-20 md:bottom-10 right-4 md:right-10 z-[70] max-w-sm w-full animate-fade-in-up">
          <div className={`p-4 rounded-xl border-2 backdrop-blur-xl shadow-2xl flex items-start gap-4 ${
            txStatus.type === 'success' ? 'bg-slate-900/95 border-green-500/50' : 
            txStatus.type === 'failed' ? 'bg-slate-900/95 border-red-500/50' : 
            'bg-slate-900/95 border-stx-accent/50'
          }`}>
            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${
              txStatus.type === 'success' ? 'bg-green-500/20 text-green-400' :
              txStatus.type === 'failed' ? 'bg-red-500/20 text-red-400' :
              'bg-stx-accent/20 text-stx-accent animate-spin text-2xl'
            }`}>
              {txStatus.type === 'success' ? '✓' : txStatus.type === 'failed' ? '✕' : '⟳'}
            </div>
            <div className="flex-1">
              <p className={`font-black text-xs uppercase tracking-widest mb-1 ${
                txStatus.type === 'success' ? 'text-green-400' :
                txStatus.type === 'failed' ? 'text-red-400' :
                'text-stx-accent'
              }`}>
                {txStatus.type === 'pending' ? 'Blockchain Sync' : `Status: ${txStatus.type}`}
              </p>
              <p className="text-white text-sm font-medium leading-tight">{txStatus.message}</p>
              {txStatus.txId && (
                <a href={`https://explorer.hiro.so/txid/${txStatus.txId}?chain=mainnet`} target="_blank" rel="noreferrer" className="inline-block mt-3 text-[10px] font-bold text-stx-accent hover:text-white transition-colors border-b border-stx-accent/30 uppercase tracking-tighter">
                  Verify on Explorer ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar & Content Layout remain the same as previous design */}
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-[#0F172A]/95 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-stx-accent rounded flex items-center justify-center font-bold text-white">G</div>
          <span className="font-bold text-lg text-white tracking-tighter text-stx-accent uppercase">Genesis One</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-slate-800 text-white border-l-2 border-stx-accent' : 'text-slate-500 hover:text-slate-300'}`}>
              <span className="text-lg opacity-80">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-y-auto h-screen">
        <header className="sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold md:hidden text-white">GENESIS</h2>
          <div className="hidden md:block text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Validated Session</div>
          <div>{walletButton}</div>
        </header>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full pb-24">{children}</div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-slate-800 flex justify-around p-4 z-50">
         {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-stx-accent' : 'text-slate-600'}`}>
              <span className="text-xl">{item.icon}</span><span className="text-[10px] uppercase font-bold">{item.label}</span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default Layout;
