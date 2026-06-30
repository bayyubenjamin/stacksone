import React, { useCallback, useEffect, useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { standardPrincipalCV } from '@stacks/transactions';

import { STACKSONE_MAINNET, StacksOneClient, toSafeNumber } from '../../index.js';

const network = new StacksMainnet();
const client = new StacksOneClient({ network, contracts: STACKSONE_MAINNET.contracts });

const Gaming = ({ userData }) => {
  const [userTaps, setUserTaps] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isTapping, setIsTapping] = useState(false);
  const [pendingTxId, setPendingTxId] = useState(null);

  const wallet = userData?.profile?.stxAddress?.mainnet;

  const fetchGamingStats = useCallback(async () => {
    if (!wallet) return;

    try {
      const [userResult, totalResult, leaderboardResult] = await Promise.all([
        client.callReadOnly(
          STACKSONE_MAINNET.contracts.chainTap,
          'get-user-taps',
          [standardPrincipalCV(wallet)],
          wallet,
        ),
        client.callReadOnly(
          STACKSONE_MAINNET.contracts.chainTap,
          'get-total-taps',
          [],
          wallet,
        ),
        client.callReadOnly(
          STACKSONE_MAINNET.contracts.chainTap,
          'get-leaderboard',
          [],
          wallet,
        ),
      ]);

      setUserTaps(toSafeNumber(client.decode(userResult), 0));
      setTotalTaps(toSafeNumber(client.decode(totalResult), 0));

      const decodedLeaderboard = client.decode(leaderboardResult);
      const formattedLeaderboard = Array.isArray(decodedLeaderboard)
        ? decodedLeaderboard.map((item) => ({
            who: item?.who?.value ?? item?.who ?? '',
            taps: toSafeNumber(item?.taps, 0),
          }))
        : [];

      setLeaderboard(formattedLeaderboard);
    } catch (error) {
      console.error('Failed to read ChainTap state:', error);
    }
  }, [wallet]);

  useEffect(() => {
    fetchGamingStats();
  }, [fetchGamingStats]);

  const handleTap = async () => {
    if (!wallet) {
      window.alert('Connect your wallet first');
      return;
    }

    setIsTapping(true);

    try {
      await openContractCall({
        network,
        contractAddress: STACKSONE_MAINNET.deployer,
        contractName: STACKSONE_MAINNET.contracts.chainTap,
        functionName: 'tap',
        functionArgs: [],
        onFinish: (data) => {
          setIsTapping(false);
          setPendingTxId(data.txId);
          window.setTimeout(fetchGamingStats, 20_000);
          window.setTimeout(fetchGamingStats, 60_000);
        },
        onCancel: () => setIsTapping(false),
      });
    } catch (error) {
      setIsTapping(false);
      console.error('Failed to open ChainTap transaction:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 text-white">
      <div className="bg-slate-800 p-6 rounded-xl text-center space-y-2 border border-slate-700 shadow-lg">
        <h1 className="text-3xl font-bold text-indigo-400">ChainTap Gaming</h1>
        <p className="text-slate-400">Unlimited on-chain tapping game!</p>
        <div className="flex justify-center gap-8 pt-4">
          <div className="bg-slate-900 px-6 py-3 rounded-lg">
            <p className="text-sm text-slate-500 font-mono">Your Score</p>
            <p className="text-2xl font-bold text-green-400">{userTaps} Taps</p>
          </div>
          <div className="bg-slate-900 px-6 py-3 rounded-lg">
            <p className="text-sm text-slate-500 font-mono">Global Total</p>
            <p className="text-2xl font-bold text-blue-400">{totalTaps} Taps</p>
          </div>
        </div>
        {pendingTxId && (
          <p className="text-xs text-amber-300 font-mono pt-3">
            Transaction submitted: {pendingTxId.slice(0, 10)}... awaiting confirmation
          </p>
        )}
      </div>

      <div className="flex justify-center py-10">
        <button
          onClick={handleTap}
          disabled={isTapping || !wallet}
          className={`w-48 h-48 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center border-4 border-indigo-500 transition-transform duration-100 ease-in-out active:scale-95 ${
            !wallet
              ? 'opacity-50 cursor-not-allowed border-slate-500 shadow-none bg-slate-800'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          <span className="text-4xl font-bold">{isTapping ? '...' : 'TAP!'}</span>
          <span className="text-sm opacity-70 mt-2 font-mono">On-chain Tx</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <div className="bg-slate-900 p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-center">🏆 Top 10 Leaderboard 🏆</h2>
        </div>
        <div className="p-4">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-2">Address</th>
                <th className="py-3 px-2 text-right">Score/Taps</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.filter((item) => item.taps > 0).map((item, index) => (
                <tr key={`${item.who}-${index}`} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-2">#{index + 1}</td>
                  <td className="py-3 px-2">
                    {item.who === wallet ? <span className="text-green-400">{item.who} (You)</span> : item.who}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-indigo-300">{item.taps}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.every((item) => item.taps === 0) && (
            <p className="text-center py-6 text-slate-500">No confirmed taps yet. Be the first.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gaming;
