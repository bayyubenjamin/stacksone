import React, { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network'; // <--- PAKAI MAINNET
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  uintCV,
  cvToValue 
} from '@stacks/transactions';
import { userSession } from '../supabaseClient'; 

const Vault = () => {
  const [poinBalance, setPoinBalance] = useState(0);
  const [oneBalance, setOneBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [status, setStatus] = useState('');

  // INI CONFIG MAINNET
  const network = new StacksMainnet();
  
  // PENTING: Nanti ganti ini dengan alamat wallet Anda yang dipakai deploy di Mainnet
  const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; // Contoh pakai alamat genesis Anda

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      fetchBalances();
    }
  }, []);

  const fetchBalances = async () => {
    const userAddress = userSession.loadUserData().profile.stxAddress.mainnet; // <--- AMBIL ALAMAT MAINNET

    // Fetch Poin Balance
    try {
      const poinData = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'token-poin',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      // Pastikan handle jika return value berbeda format (tergantung respons u128/uint)
      const val = cvToValue(poinData);
      setPoinBalance(Number(val.value) / 1000000); 
    } catch (e) {
      console.log("Belum punya Poin atau kontrak belum deploy");
    }

    // Fetch ONE Balance
    try {
      const oneData = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'token-one',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      const val = cvToValue(oneData);
      setOneBalance(Number(val.value) / 1000000);
    } catch (e) {
        console.log("Belum punya ONE");
    }
  };

  const handleDailyClaim = () => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'faucet-distributor',
      functionName: 'claim-daily',
      functionArgs: [],
      onFinish: (data) => {
        setStatus('Transaksi Claim dikirim! Tunggu konfirmasi blok.');
      },
    });
  };

  const handleSpinGacha = () => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'utility-gacha',
      functionName: 'spin-gacha',
      functionArgs: [],
      onFinish: (data) => {
        setStatus('Gacha diputar... Semoga beruntung!');
      },
    });
  };

  const handleStake = () => {
    if (!stakeAmount) return;
    const amount = parseFloat(stakeAmount) * 1000000; 
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'staking-refinery',
      functionName: 'stake-tokens',
      functionArgs: [uintCV(amount)],
      onFinish: (data) => {
        setStatus('Staking dimulai!');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Mainnet Vault</h1>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-gray-400 text-sm">Fuel (POIN)</h3>
          <p className="text-2xl font-bold">{poinBalance}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-yellow-600">
          <h3 className="text-yellow-400 text-sm">Gem ($ONE)</h3>
          <p className="text-2xl font-bold">{oneBalance}</p>
        </div>
      </div>

      {/* Daily Claim */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Daily Supply</h2>
        <p className="text-gray-400 text-sm mb-4">Claim POIN gratis tiap 24 jam (144 blok).</p>
        <button 
          onClick={handleDailyClaim}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
        >
          Claim Daily POIN
        </button>
      </div>

      {/* Staking */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-2">Refinery (Staking)</h2>
        <p className="text-gray-400 text-sm mb-4">Kunci POIN untuk menambang $ONE.</p>
        <div className="flex gap-2 mb-4">
          <input 
            type="number" 
            placeholder="Jumlah POIN" 
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-600 text-white"
          />
        </div>
        <button 
          onClick={handleStake}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg"
        >
          Start Staking
        </button>
      </div>

      {/* Gacha */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-xl mb-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Lucky Burn</h2>
        <p className="text-gray-300 text-sm mb-4">Bakar 50 POIN untuk kesempatan dapat $ONE!</p>
        <button 
          onClick={handleSpinGacha}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 rounded-lg"
        >
          Spin (Biaya: 50 POIN)
        </button>
      </div>

      {status && (
        <div className="fixed bottom-24 left-4 right-4 bg-gray-700 p-4 rounded-lg text-center text-sm border border-yellow-500">
          {status}
        </div>
      )}
    </div>
  );
};

export default Vault;
