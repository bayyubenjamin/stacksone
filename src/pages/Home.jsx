import React, { useCallback, useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';

import { BADGE_CATALOG, STACKSONE_MAINNET, StacksOneClient } from '../../index.js';

const network = new StacksMainnet();
const client = new StacksOneClient({ network, contracts: STACKSONE_MAINNET.contracts });

const BadgeCard = ({ id, title, subtitle, reqText, isLocked, isMinted, isPending, onMint, icon, isLoading }) => (
  <div className={`relative group flex flex-col justify-between p-6 rounded-xl border bg-app-card transition-all duration-300 animate-slide-up hover:-translate-y-1 ${
    isLocked ? 'border-app-border opacity-60' : isMinted ? 'border-green-500/30' : 'border-app-border hover:border-app-accent hover:shadow-lg hover:shadow-app-accent/5'
  }`}>
    <div>
      <div className="flex justify-between items-start mb-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${
          isMinted ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
        }`}>
          {isMinted ? '✓' : icon}
        </div>
        {isMinted && <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Owned</span>}
        {isPending && !isMinted && <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Pending</span>}
        {isLocked && !isPending && <span className="bg-zinc-800 text-zinc-500 border border-zinc-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Locked</span>}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-[11px] font-medium tracking-widest uppercase mb-4 text-app-accent">{subtitle}</p>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">{reqText}</p>
    </div>
    <button
      onClick={() => onMint(id)}
      disabled={isLocked || isMinted || isPending || isLoading}
      className={`w-full py-2.5 rounded-md text-sm font-medium transition-all ${
        isMinted ? 'bg-zinc-800/50 text-zinc-500 cursor-default' : isPending ? 'bg-amber-500/10 text-amber-300 cursor-wait' : isLocked ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
      }`}
    >
      {isMinted ? 'Badge Secured' : isPending ? 'Awaiting Confirmation' : isLoading ? 'Syncing...' : isLocked ? 'Requirements Not Met' : 'Mint Badge'}
    </button>
  </div>
);

const Home = ({ userData, userXP, userLevel, handleMint }) => {
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [badges, setBadges] = useState(() => BADGE_CATALOG.map((badge) => ({ ...badge, isMinted: false })));
  const [pendingBadgeIds, setPendingBadgeIds] = useState(() => new Set());
  const wallet = userData?.profile?.stxAddress?.mainnet;

  const syncBadgeStatusFromBlockchain = useCallback(async () => {
    if (!wallet) {
      setBadges(BADGE_CATALOG.map((badge) => ({ ...badge, isMinted: false })));
      setPendingBadgeIds(new Set());
      return;
    }

    setLoadingBadges(true);
    try {
      const updatedBadges = await Promise.all(BADGE_CATALOG.map(async (badge) => ({
        ...badge,
        isMinted: await client.hasBadge(wallet, badge.id),
      })));

      setBadges(updatedBadges);
      setPendingBadgeIds((current) => {
        const next = new Set(current);
        updatedBadges.forEach((badge) => {
          if (badge.isMinted) next.delete(badge.id);
        });
        return next;
      });
    } catch (error) {
      console.error('Error syncing badges:', error);
    } finally {
      setLoadingBadges(false);
    }
  }, [wallet]);

  useEffect(() => {
    syncBadgeStatusFromBlockchain();
  }, [syncBadgeStatusFromBlockchain]);

  const onMintClick = async (badgeId) => {
    if (pendingBadgeIds.has(badgeId)) return;

    const submitted = await handleMint(badgeId);
    if (!submitted) return;

    setPendingBadgeIds((current) => new Set(current).add(badgeId));
    window.setTimeout(syncBadgeStatusFromBlockchain, 20_000);
    window.setTimeout(syncBadgeStatusFromBlockchain, 60_000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {loadingBadges && <div className="absolute -top-6 right-0 flex items-center text-xs text-app-muted animate-pulse-subtle">Syncing records...</div>}
      {userData && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 bg-app-card border border-app-border p-5 rounded-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Accumulated XP</p>
            <p className="text-3xl font-medium text-white tracking-tight">{userXP.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-app-card border border-app-border p-5 rounded-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Current Level</p>
            <p className="text-3xl font-medium text-white tracking-tight">{userLevel}</p>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Identity Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {badges.map((badge, index) => (
            <div key={badge.id} style={{ animationDelay: `${index * 100}ms` }}>
              <BadgeCard
                {...badge}
                isPending={pendingBadgeIds.has(badge.id)}
                isLocked={!userData || userLevel < badge.minLevel || userXP < badge.minXP}
                isLoading={loadingBadges}
                onMint={onMintClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
