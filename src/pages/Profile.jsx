import React, { useState, useEffect, useCallback } from 'react';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, standardPrincipalCV, cvToValue } from '@stacks/transactions';
import { userSession } from '../supabaseClient';
import { Wallet, Award, Zap, Box, Copy, ExternalLink, RefreshCw, Hexagon, CheckCircle } from 'lucide-react';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState({ poin: 0, one: 0 });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const network = new StacksMainnet();

  const fetchData = useCallback(async () => {
    if (!userSession.isUserSignedIn()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const user = userSession.loadUserData();
    setUserData(user);
    
    if (user?.profile?.stxAddress) {
      const stxAddress = user.profile.stxAddress.mainnet;
      setAddress(stxAddress);
      await Promise.all([
        fetchBalances(stxAddress),
        fetchBadges(stxAddress)
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- DATA FETCHING ---
  const fetchBalances = async (userAddress) => {
    try {
      const [poinData, oneData] = await Promise.all([
        callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: 'token-poin',
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(userAddress)],
          network,
          senderAddress: userAddress
        }),
        callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: 'token-one',
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(userAddress)],
          network,
          senderAddress: userAddress
        })
      ]);

      setBalances({
        poin: Number(cvToValue(poinData).value) / 1000000,
        one: Number(cvToValue(oneData).value) / 1000000
      });
    } catch (e) {
      console.error("Failed to load token balance:", e);
    }
  };

  const fetchBadges = async (userAddress) => {
    try {
      // Using Hiro API to fetch all NFTs owned by the wallet
      const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tokens/nft/holdings?principal=${userAddress}`);
      const data = await response.json();
      
      if (data && data.results) {
        // Specific filter for genesis-badges contract
        const badgeHoldings = data.results.filter(
          item => item.asset_identifier.includes(`${CONTRACT_ADDRESS}.genesis-badges`)
        );

        // Mapping API NFT data to UI format
        const formattedBadges = badgeHoldings.map((item) => {
          const tokenId = item.value.repr.replace('u', ''); // Remove 'u' from uint
          return {
            id: tokenId,
            name: `Genesis Badge #${tokenId}`,
            description: "On-Chain Achievement in the StacksOne Ecosystem.",
            imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}&backgroundColor=0f172a,1e293b&shape1Color=6366f1` 
          };
        });

        // Mock Fallback if user doesn't have a badge yet (For UI preview)
        if (formattedBadges.length === 0) {
          setBadges([
            { id: '1', name: 'Pioneer Staker', description: 'Made the first stake in the Refinery.', earned: true },
            { id: '2', name: 'Lucky Burner', description: 'Won a prize from the Utility Gacha.', earned: true }
          ]);
        } else {
          setBadges(formattedBadges);
        }
      }
    } catch (e) {
      console.error("Failed to load badges data:", e);
      setBadges([]);
    }
  };

  // --- UTILS ---
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // --- RENDER NOT CONNECTED ---
  if (!userSession.isUserSignedIn()) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
        <div className="text-center bg-[#1E293B] p-10 rounded-3xl border border-slate-700 max-w-md w-full">
          <Wallet size={48} className="text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Disconnected</h2>
          <p className="text-slate-400 mb-6 text-sm">Please connect your Stacks wallet to view your profile, assets, and achievement badges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 pb-20 font-sans">
      {/* HEADER: IDENTITY */}
      <div className="bg-gradient-to-b from-indigo-950/50 to-[#0B1120] border-b border-slate-800 pt-10 pb-8 px-6 md:px-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Avatar (Generated based on address) */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl shadow-indigo-900/20">
              <div className="w-full h-full bg-[#0B1120] rounded-xl overflow-hidden flex items-center justify-center">
                <img 
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=transparent`} 
                  alt="Avatar" 
                  className="w-16 h-16 opacity-80"
                />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-[#0B1120] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Web3 Identity</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-1.5">
                <span className="text-sm font-mono text-indigo-300">{truncateAddress(address)}</span>
                <button onClick={copyAddress} className="text-slate-400 hover:text-white transition-colors">
                  {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
              <a 
                href={`https://explorer.hiro.so/address/${address}?chain=mainnet`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                View on Explorer <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* SECTION 1: WALLET ASSETS */}
        <section>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Wallet className="text-indigo-400" /> Available Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* POIN Card */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Zap size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Staking Token</span>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium mb-1">$POIN Balance</p>
                {loading ? (
                  <div className="h-10 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                ) : (
                  <h3 className="text-4xl font-bold text-white">{balances.poin.toLocaleString()}</h3>
                )}
              </div>
            </div>

            {/* ONE Card */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                  <Box size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Main Token</span>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium mb-1">$ONE Balance</p>
                {loading ? (
                  <div className="h-10 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                ) : (
                  <h3 className="text-4xl font-bold text-white">{balances.one.toLocaleString()}</h3>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: WEB3 BADGES (NFTs) */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="text-emerald-400" /> Genesis Badges
            </h2>
            <span className="text-sm font-medium text-slate-500">
              Total: <span className="text-white">{badges.length}</span>
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#1E293B] h-48 rounded-3xl border border-slate-700 animate-pulse"></div>
              ))}
            </div>
          ) : badges.length === 0 ? (
            <div className="bg-[#0F172A] border border-dashed border-slate-700 rounded-3xl p-10 text-center">
              <Hexagon size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Badges Yet</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">Complete missions on the Tasks page or perform transactions in the Vault to start minting your Web3 identity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {badges.map((badge, idx) => (
                <div key={idx} className="bg-[#1E293B]/60 border border-slate-700 rounded-3xl p-4 flex flex-col items-center text-center hover:bg-[#1E293B] hover:border-emerald-500/50 transition-all group cursor-pointer relative overflow-hidden">
                  
                  {/* Efek Shine saat hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  
                  {/* Badge Image / Placeholder */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-4 p-2 flex items-center justify-center border border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-contain" />
                    ) : (
                      <Hexagon size={40} className="text-emerald-400" />
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1 block">
                      Badge #{badge.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mb-1 leading-tight">{badge.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Profile;
