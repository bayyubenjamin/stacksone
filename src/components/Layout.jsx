import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, walletButton }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { id: 'home', label: 'Overview', icon: '💠', path: '/home' },
    { id: 'tasks', label: 'Protocol', icon: '📋', path: '/tasks' },
    { id: 'vault', label: 'Vault', icon: '🔒', path: '/vault' }, 
    { id: 'gaming', label: 'Gaming', icon: '🎮', path: '/gaming' }, 
    { id: 'profile', label: 'Identity', icon: '👤', path: '/profile' }
  ];

  return (
    <div className="min-h-screen flex bg-[#0B1120] text-slate-200 font-sans overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-[#0F172A]/95 backdrop-blur-xl z-20">

        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-stx-accent rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            G
          </div>

          <span className="font-bold tracking-tight text-lg text-white">
            GENESIS <span className="text-stx-accent">ONE</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                currentPath.includes(item.path)
                  ? 'bg-slate-800 text-white border-l-2 border-stx-accent'
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col relative overflow-y-auto h-screen">

        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">

          <div className="hidden md:block text-slate-500 text-xs uppercase tracking-widest font-semibold">
            Secure Environment • Modular On-Chain Engine
          </div>

          <div>
            {walletButton}
          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full flex-1">
          {children}
        </div>

        {/* --- TAMBAHAN FOOTER SOCIAL MEDIA DI SINI --- */}
        <footer className="w-full border-t border-slate-800/50 py-8 mt-auto pb-24 md:pb-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Join The Community
            </span>
            <div className="flex items-center gap-6">
              <a 
                href="https://t.me/+urf3qEq3FkE2NDA1" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center gap-2"
              >
                ✈️ Telegram
              </a>
              <a 
                href="https://x.com/stacksone_ngasal" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center gap-2"
              >
                🐦 X (Twitter)
              </a>
              <a 
                href="https://discord.gg/ngasaldulu" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center gap-2"
              >
                👾 Discord
              </a>
            </div>
          </div>
        </footer>
        {/* --- AKHIR TAMBAHAN --- */}

      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 flex justify-around py-2 z-30">

        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center text-xs font-medium ${
              currentPath.includes(item.path)
                ? 'text-stx-accent'
                : 'text-slate-500'
            }`}
          >

            <span className="text-lg">{item.icon}</span>

            {item.label}

          </Link>
        ))}

      </div>

    </div>
  );
};

export default Layout;
