import React from 'react';

const Layout = ({ children, activeTab, setActiveTab, walletButton }) => {
  const menuItems = [
    { id: 'home', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Protocol', icon: '💠' },
    { id: 'vault', label: 'Vault', icon: '🏦' }, // <--- MENU BARU
    { id: 'profile', label: 'Identity', icon: '🆔' },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B1120] text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-[#0F172A]/95 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-stx-accent rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">G</div>
          <span className="font-bold tracking-tight text-lg text-white">GENESIS <span className="text-stx-accent">ONE</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-slate-800 text-white border-l-2 border-stx-accent'
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs font-bold text-slate-300">Operational</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-slate-800 flex justify-around p-4 z-50">
         {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-stx-accent' : 'text-slate-600'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wide">{item.label}</span>
            </button>
          ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto h-screen">
        <header className="sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold md:hidden text-white tracking-tight">GENESIS</h2>
          <div className="hidden md:block text-slate-500 text-xs uppercase tracking-widest font-semibold">
            Secure Environment
          </div>
          <div>{walletButton}</div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full pb-24 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

