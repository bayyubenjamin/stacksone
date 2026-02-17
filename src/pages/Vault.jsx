import React, { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network'; 
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  uintCV,
  cvToValue,
  PostConditionMode
} from '@stacks/transactions';
import { userSession } from '../supabaseClient'; 

const Vault = () => {
  const [poinBalance, setPoinBalance] = useState(0);
  const [oneBalance, setOneBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const network = new StacksMainnet();
  
  // Pastikan alamat ini sesuai dengan wallet deployer Anda
  const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; 

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      fetchBalances();
    }
  }, []);

  const fetchBalances = async () => {
    if (!userSession.isUserSignedIn()) return;
    
    setLoading(true);
    const userAddress = userSession.loadUserData().profile.stxAddress.mainnet;

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
      const val = cvToValue(poinData);
      setPoinBalance(Number(val.value) / 1000000); 
    } catch (e) {
      console.log("No POIN found or contract not ready.");
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
        console.log("No ONE found.");
    }
    setLoading(false);
  };

  const handleDailyClaim = () => {
    openContractCall({
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'faucet-distributor',
      functionName: 'claim-daily',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        setStatus('Claim transaction broadcasted! Balance will update after block confirmation.');
        // Refresh balance immediately (it might take time to reflect on-chain)
        setTimeout(() => fetchBalances(), 2000);
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
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        setStatus('Gacha spinning... Transaction sent! Good luck.');
        setTimeout(() => fetchBalances(), 2000);
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
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        setStatus('Staking initiated! Your assets are being locked.');
        setTimeout(() => fetchBalances(), 2000);
        setStakeAmount(''); // Reset input
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Mainnet Vault</h1>
        <button 
          onClick={fetchBalances}
          className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-600 transition-colors"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Balance'}
        </button>
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">⛽</div>
          <h3 className="text-gray-400 text-sm font-medium uppercase">Fuel Token</h3>
          <p className="text-2xl font-bold mt-1">{poinBalance} <span className="text-sm text-blue-400">$POIN</span></p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-yellow-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">💎</div>
          <h3 className="text-yellow-400 text-sm font-medium uppercase">Precious Gem</h3>
          <p className="text-2xl font-bold mt-1">{oneBalance} <span className="text-sm text-yellow-400">$ONE</span></p>
        </div>
      </div>

      {/* Daily Claim */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg border border-gray-700/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Daily Supply</h2>
            <p className="text-gray-400 text-sm mt-1">Claim free $POIN every 24 hours (approx. 144 blocks).</p>
          </div>
          <span className="text-2xl">🎁</span>
        </div>
        <button 
          onClick={handleDailyClaim}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          Claim Daily $POIN
        </button>
      </div>

      {/* Staking */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Refinery (Staking)</h2>
            <p className="text-gray-400 text-sm mt-1">Lock your $POIN to mine valuable $ONE tokens.</p>
          </div>
          <span className="text-2xl">🏭</span>
        </div>
        
        <div className="flex gap-2 mb-4">
          <div className="relative w-full">
            <input 
              type="number" 
              placeholder="Amount to stake" 
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full p-3 bg-gray-900 rounded-lg border border-gray-600 text-white focus:border-green-500 focus:outline-none transition-colors"
            />
            <span className="absolute right-3 top-3 text-gray-500 text-sm font-bold">POIN</span>
          </div>
        </div>
        <button 
          onClick={handleStake}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-green-900/20 active:scale-95"
        >
          Start Staking
        </button>
      </div>

      {/* Gacha */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-xl mb-6 shadow-lg border border-purple-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Lucky Burn</h2>
            <p className="text-gray-300 text-sm mt-1">Burn 50 $POIN for a 33% chance to win $ONE!</p>
          </div>
          <span className="text-2xl">🎰</span>
        </div>
        <button 
          onClick={handleSpinGacha}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-purple-900/20 active:scale-95 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1"
        >
          Spin Gacha (Cost: 50 POIN)
        </button>
      </div>

      {status && (
        <div className="fixed bottom-24 left-4 right-4 bg-gray-800/90 backdrop-blur-md p-4 rounded-lg text-center text-sm border border-yellow-500/50 shadow-2xl animate-fade-in-up z-50">
          <p className="font-semibold text-yellow-400 mb-1">Status Update</p>
          <p className="text-gray-200">{status}</p>
        </div>
      )}
    </div>
  );
};

export default Vault;
