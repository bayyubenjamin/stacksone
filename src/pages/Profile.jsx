import React, { useCallback, useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import { standardPrincipalCV } from '@stacks/transactions';
import {
  Award,
  Box,
  CheckCircle,
  Copy,
  ExternalLink,
  Hexagon,
  RefreshCw,
  Wallet,
  Zap,
} from 'lucide-react';

import { STACKSONE_MAINNET, StacksOneClient, toSafeNumber } from '../../index.js';
import { userSession } from '../supabaseClient';

const network = new StacksMainnet();
const client = new StacksOneClient({
  network,
  deployer: STACKSONE_MAINNET.deployer,
  contracts: STACKSONE_MAINNET.contracts,
});

function formatTokenBalance(value) {
  return toSafeNumber(value, 0) / 1_000_000;
}

function parseTokenId(holding) {
  const repr = holding?.value?.repr;
  if (typeof repr !== 'string') return null;
  return repr.startsWith('u') ? repr.slice(1) : repr;
}

const Profile = () => {
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState({ poin: 0, one: 0 });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchBalances = useCallback(async (userAddress) => {
    const principal = standardPrincipalCV(userAddress);
    const [poinData, oneData] = await Promise.all([
      client.callReadOnly(
        STACKSONE_MAINNET.contracts.tokenPoin,
        'get-balance',
        [principal],
        userAddress,
      ),
      client.callReadOnly(
        STACKSONE_MAINNET.contracts.tokenOne,
        'get-balance',
        [principal],
        userAddress,
      ),
    ]);

    setBalances({
      poin: formatTokenBalance(client.decode(poinData)),
      one: formatTokenBalance(client.decode(oneData)),
    });
  }, []);

  const fetchBadges = useCallback(async (userAddress) => {
    const response = await fetch(
      `https://api.mainnet.hiro.so/extended/v1/tokens/nft/holdings?principal=${encodeURIComponent(userAddress)}`,
    );

    if (!response.ok) {
      throw new Error(`NFT holdings request failed with status ${response.status}`);
    }

    const data = await response.json();
    const expectedAssetPrefix = `${STACKSONE_MAINNET.deployer}.${STACKSONE_MAINNET.contracts.badges}::`;
    const holdings = Array.isArray(data?.results) ? data.results : [];

    const formattedBadges = holdings
      .filter((item) => item?.asset_identifier?.startsWith(expectedAssetPrefix))
      .map((item) => {
        const tokenId = parseTokenId(item);
        if (!tokenId) return null;

        return {
          id: tokenId,
          name: `Genesis Badge #${tokenId}`,
          description: 'Confirmed on-chain achievement in the StacksOne ecosystem.',
          imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(tokenId)}&backgroundColor=0f172a,1e293b&shape1Color=6366f1`,
        };
      })
      .filter(Boolean);

    setBadges(formattedBadges);
  }, []);

  const fetchData = useCallback(async () => {
    if (!userSession.isUserSignedIn()) {
      setAddress('');
      setBalances({ poin: 0, one: 0 });
      setBadges([]);
      setLoading(false);
      return;
    }

    const user = userSession.loadUserData();
    const userAddress = user?.profile?.stxAddress?.mainnet;

    if (!userAddress) {
      setLoadError('The connected wallet does not expose a mainnet address.');
      setLoading(false);
      return;
    }

    setAddress(userAddress);
    setLoading(true);
    setLoadError(null);

    const results = await Promise.allSettled([
      fetchBalances(userAddress),
      fetchBadges(userAddress),
    ]);

    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      failures.forEach((failure) => console.error('Profile data request failed:', failure.reason));
      setLoadError('Some on-chain profile data could not be loaded. Refresh to try again.');
    }

    setLoading(false);
  }, [fetchBadges, fetchBalances]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyAddress = async () => {
    if (!address || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch (error) {
      console.error('Failed to copy wallet address:', error);
    }
  };

  const truncateAddress = (value) => value
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : '';

  if (!userSession.isUserSignedIn()) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
        <div className="text-center bg-[#1E293B] p-10 rounded-3xl border border-slate-700 max-w-md w-full">
          <Wallet size={48} className="text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Disconnected</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Connect your Stacks wallet to view confirmed assets and achievement badges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 pb-20 font-sans">
      <div className="bg-gradient-to-b from-indigo-950/50 to-[#0B1120] border-b border-slate-800 pt-10 pb-8 px-6 md:px-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl shadow-indigo-900/20">
              <div className="w-full h-full bg-[#0B1120] rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(address)}&backgroundColor=transparent`}
                  alt="Wallet identicon"
                  className="w-16 h-16 opacity-80"
                />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-[#0B1120] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              MAINNET
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Web3 Identity</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-1.5">
                <span className="text-sm font-mono text-indigo-300">{truncateAddress(address)}</span>
                <button onClick={copyAddress} className="text-slate-400 hover:text-white transition-colors" aria-label="Copy wallet address">
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
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        {loadError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {loadError}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Wallet className="text-indigo-400" /> Available Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400"><Zap size={28} /></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Staking Token</span>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">$POIN Balance</p>
              {loading ? <div className="h-10 w-32 bg-slate-700/50 rounded animate-pulse" /> : <h3 className="text-4xl font-bold text-white">{balances.poin.toLocaleString()}</h3>}
            </div>

            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400"><Box size={28} /></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Main Token</span>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">$ONE Balance</p>
              {loading ? <div className="h-10 w-32 bg-slate-700/50 rounded animate-pulse" /> : <h3 className="text-4xl font-bold text-white">{balances.one.toLocaleString()}</h3>}
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Award className="text-emerald-400" /> Genesis Badges</h2>
            <span className="text-sm font-medium text-slate-500">Confirmed: <span className="text-white">{badges.length}</span></span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => <div key={item} className="bg-[#1E293B] h-48 rounded-3xl border border-slate-700 animate-pulse" />)}
            </div>
          ) : badges.length === 0 ? (
            <div className="bg-[#0F172A] border border-dashed border-slate-700 rounded-3xl p-10 text-center">
              <Hexagon size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Confirmed Badges</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">Only NFTs confirmed under the current StacksOne badge contract are displayed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {badges.map((badge) => (
                <div key={badge.id} className="bg-[#1E293B]/60 border border-slate-700 rounded-3xl p-4 flex flex-col items-center text-center hover:bg-[#1E293B] hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-4 p-2 flex items-center justify-center border border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                    <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1 block">Badge #{badge.id}</span>
                  <h3 className="text-sm font-bold text-white mb-1 leading-tight">{badge.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{badge.description}</p>
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
