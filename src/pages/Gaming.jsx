import React, { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  cvToValue 
} from '@stacks/transactions';

// Ganti dengan alamat deployer dari kontrak chaintap kamu
const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; 
const CONTRACT_NAME = 'chaintap';

const network = new StacksMainnet();

const Gaming = ({ userData }) => {
  const [userTaps, setUserTaps] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isTapping, setIsTapping] = useState(false);

  const wallet = userData?.profile?.stxAddress?.mainnet;

  useEffect(() => {
    if (wallet) {
      fetchGamingStats();
    }
  }, [wallet]);

  const fetchGamingStats = async () => {
    try {
      // 1. Ambil poin/taps dari user saat ini
      const userRes = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-taps',
        functionArgs: [standardPrincipalCV(wallet)],
        network,
        senderAddress: wallet
      });
      setUserTaps(Number(cvToValue(userRes)));

      // 2. Ambil total keseluruhan taps di chain
      const totalRes = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-total-taps',
        functionArgs: [],
        network,
        senderAddress: wallet
      });
      setTotalTaps(Number(cvToValue(totalRes)));

      // 3. Ambil leaderboard top 10
      const leadRes = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-leaderboard',
        functionArgs: [],
        network,
        senderAddress: wallet
      });
      
      const rawLeaderboard = cvToValue(leadRes);
      // Format array agar lebih mudah di-render (mengubah BigInt ke Number jika ada)
      const formattedLeaderboard = rawLeaderboard.map((item) => ({
        who: item.who.value || item.who,
        taps: Number(item.taps.value !== undefined ? item.taps.value : item.taps)
      }));
      
      setLeaderboard(formattedLeaderboard);
    } catch (error) {
      console.error("Gagal mengambil data dari contract chaintap:", error);
    }
  };

  const handleTap = async () => {
    if (!userData) {
      alert("Silakan hubungkan wallet (Connect) terlebih dahulu!");
      return;
    }

    setIsTapping(true);

    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'tap',
      functionArgs: [],
      onFinish: (data) => {
        console.log("Tap berhasil dikirim! Tx ID:", data.txId);
        setIsTapping(false);
        // Bisa tambahkan toast/notifikasi di sini
      },
      onCancel: () => {
        setIsTapping(false);
        console.log("Tap dibatalkan oleh user");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 text-white">
      {/* Header Info */}
      <div className="bg-slate-800 p-6 rounded-xl text-center space-y-2 border border-slate-700 shadow-lg">
        <h1 className="text-3xl font-bold text-indigo-400">ChainTap Gaming</h1>
        <p className="text-slate-400">Unlimited on-chain tapping game!</p>
        <div className="flex justify-center gap-8 pt-4">
          <div className="bg-slate-900 px-6 py-3 rounded-lg">
            <p className="text-sm text-slate-500 font-mono">Poin Kamu</p>
            <p className="text-2xl font-bold text-green-400">{userTaps} Taps</p>
          </div>
          <div className="bg-slate-900 px-6 py-3 rounded-lg">
            <p className="text-sm text-slate-500 font-mono">Total Global</p>
            <p className="text-2xl font-bold text-blue-400">{totalTaps} Taps</p>
          </div>
        </div>
      </div>

      {/* Main Action - Tap Button */}
      <div className="flex justify-center py-10">
        <button
          onClick={handleTap}
          disabled={isTapping || !userData}
          className={`
            w-48 h-48 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] 
            flex flex-col items-center justify-center border-4 border-indigo-500
            transition-transform duration-100 ease-in-out active:scale-95
            ${!userData ? 'opacity-50 cursor-not-allowed border-slate-500 shadow-none bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500'}
          `}
        >
          <span className="text-4xl font-bold">{isTapping ? "..." : "TAP!"}</span>
          <span className="text-sm opacity-70 mt-2 font-mono">Tx Normal</span>
        </button>
      </div>

      {/* Leaderboard Table */}
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
              {leaderboard.map((item, index) => {
                // Hanya tampilkan jika poinnya > 0 agar bersih
                if (item.taps === 0) return null;
                return (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-2">#{index + 1}</td>
                    <td className="py-3 px-2">
                      {item.who === wallet ? <span className="text-green-400">{item.who} (Kamu)</span> : item.who}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-indigo-300">{item.taps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {leaderboard.every(item => item.taps === 0) && (
            <p className="text-center py-6 text-slate-500">Belum ada pemain. Jadilah yang pertama!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gaming;
