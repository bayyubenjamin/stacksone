import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network'; 
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  uintCV,
  cvToValue,
  cvToHex,
  hexToCV,
  tupleCV,
  PostConditionMode
} from '@stacks/transactions';
import { userSession } from '../supabaseClient'; 
import { CheckCircle, Clock, Zap, Box, Lock, TrendingUp, RefreshCw, AlertCircle, Unlock } from 'lucide-react';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; 
const BLOCKS_PER_DAY = 144;
const LOCK_PERIOD_BLOCKS = 1008; // ~7 Days

const Vault = () => {
  // State: Assets
  const [balances, setBalances] = useState({ poin: 0, one: 0 });
  
  // State: Network & Staking Logic
  const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
  const [lastClaimHeight, setLastClaimHeight] = useState(0); 
  const [activeStakes, setActiveStakes] = useState([]);
  const [totalStaked, setTotalStaked] = useState(0);
  
  // State: UI & Actions
  const [stakeAmount, setStakeAmount] = useState('');
  const [status, setStatus] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [actionLoading, setActionLoading] = useState(false); 

  // State: Realtime Ticker
  const [now, setNow] = useState(Date.now());
  const network = new StacksMainnet();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const baseBlockTime = useMemo(() => Date.now(), [currentBlockHeight]);
  const elapsedSinceBlock = Math.floor((now - baseBlockTime) / 1000);

  const fetchData = useCallback(async () => {
    if (!userSession.isUserSignedIn()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    await fetchNetworkStatus();
    await Promise.all([fetchBalances(), fetchFaucetData(), fetchStakingHistory()]);
    setLoading(false);
  }, [currentBlockHeight]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchNetworkStatus, 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchNetworkStatus = async () => {
    try {
      const response = await fetch(`${network.coreApiUrl}/v2/info`);
      const data = await response.json();
      if (data.stacks_tip_height) setCurrentBlockHeight(data.stacks_tip_height);
    } catch (e) {
      console.error("Failed to load block height", e);
    }
  };

  const fetchBalances = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;
    
    try {
      const [poinData, oneData] = await Promise.all([
        callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: 'token-poin-v4',
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(userAddress)],
          network,
          senderAddress: userAddress
        }),
        callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: 'token-one-v4',
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
      console.error("Failed to load balances", e); 
    }
  };

  const fetchFaucetData = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;

    try {
      const claimKeyCV = standardPrincipalCV(userAddress);

      const res = await fetch(
        `${network.coreApiUrl}/v2/map_entry/${CONTRACT_ADDRESS}/faucet-distributor-v4/last-claim-height`,
        {
          method: 'POST',
          body: JSON.stringify(cvToHex(claimKeyCV)),
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const valCV = hexToCV(data.data);
          const val = cvToValue(valCV);
          const valNum = typeof val === 'bigint' || typeof val === 'number'
            ? Number(val)
            : Number(val?.value ?? 0);

          setLastClaimHeight(valNum);
        }
      }
    } catch (e) { 
      console.error("Failed to fetch faucet data", e); 
    }
  };

  const fetchStakingHistory = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;
    
    let fetchedStakes = [];
    let accumulatedTotal = 0;
    let maxId = 10; 

    try {
      const nonceRes = await fetch(
        `${network.coreApiUrl}/v2/data_var/${CONTRACT_ADDRESS}/staking-refinery-v4/stake-nonce`
      );

      if (nonceRes.ok) {
        const nonceData = await nonceRes.json();
        const nonceVal = cvToValue(hexToCV(nonceData.data));
        maxId = Number(nonceVal?.value ?? nonceVal ?? 10);
      }
    } catch (e) { 
      console.warn("Failed to fetch nonce"); 
    }

    for (let i = 0; i < maxId; i++) {
      try {
        const keyCV = tupleCV({ staker: standardPrincipalCV(userAddress), id: uintCV(i) });

        const res = await fetch(
          `${network.coreApiUrl}/v2/map_entry/${CONTRACT_ADDRESS}/staking-refinery-v4/stakes`,
          {
            method: 'POST',
            body: JSON.stringify(cvToHex(keyCV)),
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (res.ok) {
          const data = await res.json();

          if (data.data) {
            const valCV = hexToCV(data.data);
            const val = cvToValue(valCV);
            const stakeData = val?.value ?? val;
            
            if (stakeData && stakeData['amount-poin'] !== undefined) {

              const isClaimed = stakeData.claimed?.value ?? stakeData.claimed ?? false;

              if (!isClaimed) {

                const amountVal = Number(stakeData['amount-poin']?.value ?? stakeData['amount-poin']);
                const startVal = Number(stakeData['start-height']?.value ?? stakeData['start-height']);
                const endVal = Number(stakeData['end-height']?.value ?? stakeData['end-height']);

                fetchedStakes.push({
                  id: i,
                  amount: amountVal / 1000000,
                  startBlock: startVal,
                  endBlock: endVal,
                  claimed: false
                });

                accumulatedTotal += (amountVal / 1000000);
              }
            }
          }
        }
      } catch (error) { 
        console.error(`Error stake ${i}`, error); 
      }
    }

    setActiveStakes(fetchedStakes);
    setTotalStaked(accumulatedTotal);
  };

  const handleAction = async (actionType, payload = null) => {
    if (!userSession.isUserSignedIn()) {
      setStatus({ type: 'error', msg: 'Please connect your wallet first.' });
      return;
    }

    setStatus({ type: 'info', msg: 'Awaiting wallet confirmation...' });
    setActionLoading(true);
    
    const options = {
      network,
      anchorMode: 1,
      contractAddress: CONTRACT_ADDRESS,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        setStatus({ type: 'success', msg: `Transaction Broadcasted! ID: ${data.txId.slice(0, 8)}...` });
        setActionLoading(false);
        
        if (actionType === 'claim') setLastClaimHeight(currentBlockHeight);
        else if (actionType === 'harvest' && payload) setActiveStakes(prev => prev.filter(s => s.id !== payload.id));
        else if (actionType === 'stake') {
          const amountStaked = parseFloat(stakeAmount);
          if (!isNaN(amountStaked)) setBalances(prev => ({ ...prev, poin: prev.poin - amountStaked }));
          setStakeAmount('');
        }

        setTimeout(fetchData, 10000); 
      },

      onCancel: () => {
        setStatus({ type: 'error', msg: 'Transaction cancelled by user.' });
        setActionLoading(false);
      },
    };

    try {
      if (actionType === 'stake')
        await openContractCall({
          ...options,
          contractName: 'staking-refinery-v4',
          functionName: 'stake',
          functionArgs: [uintCV(parseFloat(stakeAmount) * 1000000)]
        });
      else if (actionType === 'harvest')
        await openContractCall({
          ...options,
          contractName: 'staking-refinery-v4',
          functionName: 'harvest',
          functionArgs: [uintCV(payload.id)]
        });
      else if (actionType === 'claim')
        await openContractCall({
          ...options,
          contractName: 'faucet-distributor-v4',
          functionName: 'claim',
          functionArgs: []
        });
      else if (actionType === 'gacha')
        await openContractCall({
          ...options,
          contractName: 'utility-gacha',
          functionName: 'spin-gacha',
          functionArgs: []
        });
    } catch (error) {
      console.error("Contract call failed:", error);
      setStatus({ type: 'error', msg: 'Failed to process transaction.' });
      setActionLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return 'Ready';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const blocksToClaim = (lastClaimHeight + BLOCKS_PER_DAY) - currentBlockHeight;
  let faucetSecondsLeft = (blocksToClaim * 600) - elapsedSinceBlock;
  if (faucetSecondsLeft < 0) faucetSecondsLeft = 0;
  
  const isClaimable = lastClaimHeight === 0 || faucetSecondsLeft <= 0; 
  const nextTargetBlock = currentBlockHeight + (isClaimable ? 0 : blocksToClaim);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Box className="text-blue-400" /> Web3 Vault
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage your Stacks assets & staking.</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" /> Block Height
            </div>
            <div className="text-xl font-mono text-blue-400 font-semibold">{currentBlockHeight || 'Loading...'}</div>
          </div>
        </div>

        {/* Status Notification */}
        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            status.type === 'error' ? 'bg-red-900/30 border-red-500 text-red-300' :
            status.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-300' :
            'bg-blue-900/30 border-blue-500 text-blue-300'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{status.msg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Balances Card */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" /> Balances
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700/50">
                <span className="text-slate-400">POIN Token</span>
                <span className="text-2xl font-bold text-white">{balances.poin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700/50">
                <span className="text-slate-400">ONE Token</span>
                <span className="text-2xl font-bold text-white">{balances.one.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Faucet Card */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Zap className="text-yellow-400" /> Daily Faucet
              </h2>
              <p className="text-slate-400 text-sm mb-4">Claim free POIN tokens every 24 hours.</p>
            </div>
            
            <div className="space-y-4">
              {!isClaimable && (
                <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Available in</p>
                  <p className="text-xl font-mono text-yellow-400">{formatTime(faucetSecondsLeft)}</p>
                </div>
              )}
              
              <button 
                onClick={() => handleAction('claim')}
                disabled={!isClaimable || actionLoading}
                className={`w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-200 ${
                  isClaimable && !actionLoading
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isClaimable ? 'Claim Faucet' : 'Cooldown Active'}
              </button>
            </div>
          </div>
          
        </div>

        {/* Staking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Stake */}
          <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="text-purple-400" /> Stake POIN
            </h2>
            <p className="text-slate-400 text-sm mb-4">Lock POIN to earn ONE tokens. Minimum lock period applies.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 ml-1 mb-1 block">Amount to Stake</label>
                <input 
                  type="number" 
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <button 
                onClick={() => handleAction('stake')}
                disabled={actionLoading || !stakeAmount || Number(stakeAmount) <= 0}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 flex justify-center items-center gap-2"
              >
                {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                Stake Tokens
              </button>

              <button 
                onClick={() => handleAction('gacha')}
                disabled={actionLoading}
                className="w-full mt-2 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/30 flex justify-center items-center gap-2"
              >
                {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-4 h-4" />}
                Spin Gacha
              </button>
            </div>
          </div>

          {/* Active Stakes List */}
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Box className="text-emerald-400" /> Active Stakes
              </h2>
              <span className="text-sm bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
                Total Locked: <span className="font-bold text-white">{totalStaked.toLocaleString()}</span> POIN
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
              </div>
            ) : activeStakes.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                <p className="text-slate-400">No active stakes found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {activeStakes.map(stake => {
                  const blocksLeft = stake.endBlock - currentBlockHeight;
                  const canHarvest = blocksLeft <= 0;
                  
                  return (
                    <div key={stake.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700/50 gap-4">
                      <div>
                        <div className="text-lg font-bold text-white">{stake.amount.toLocaleString()} POIN</div>
                        <div className="text-xs text-slate-400 mt-1">
                          ID: {stake.id} | Unlocks at Block: {stake.endBlock}
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-auto text-right flex flex-col items-end gap-2">
                        {!canHarvest && (
                          <div className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md whitespace-nowrap">
                            <Clock className="w-3 h-3 inline mr-1" />
                            ~{blocksLeft} blocks left
                          </div>
                        )}
                        <button
                          onClick={() => handleAction('harvest', { id: stake.id })}
                          disabled={!canHarvest || actionLoading}
                          className={`px-6 py-2 rounded-lg font-semibold w-full sm:w-auto flex justify-center items-center gap-2 transition-colors ${
                            canHarvest 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {canHarvest ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          Harvest
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Vault;
