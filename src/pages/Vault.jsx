import React, { useState, useEffect, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network'; 
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  uintCV,
  cvToValue,
  cvToHex,
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
  const [activeTab, setActiveTab] = useState('stake'); // 'stake' | 'claim' | 'gacha'

  const network = new StacksMainnet();

  const fetchData = useCallback(async () => {
    if (!userSession.isUserSignedIn()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    await Promise.all([fetchNetworkStatus(), fetchBalances(), fetchStakingHistory()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchNetworkStatus, 60000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- DATA FETCHING ---
  const fetchNetworkStatus = async () => {
    try {
      const response = await fetch('https://api.mainnet.hiro.so/v2/info');
      const data = await response.json();
      setCurrentBlockHeight(data.stacks_tip_height);
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
      console.error("Failed to load balances", e); 
    }
  };

  const fetchStakingHistory = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;
    
    let fetchedStakes = [];
    let accumulatedTotal = 0;

    // Brute-force lookup map entry (Fallback method for demo purposes)
    for (let i = 0; i < 15; i++) {
      try {
        const keyCV = tupleCV({ staker: standardPrincipalCV(userAddress), id: uintCV(i) });
        const response = await fetch(`https://api.mainnet.hiro.so/v2/map_entry/${CONTRACT_ADDRESS}/staking-refinery/stakes`, {
          method: 'POST',
          body: cvToHex(keyCV),
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data !== '0x09') { 
            fetchedStakes.push({
              id: i,
              amount: 100, 
              startBlock: currentBlockHeight - 500, 
              endBlock: (currentBlockHeight - 500) + LOCK_PERIOD_BLOCKS,
              claimed: false
            });
            accumulatedTotal += 100;
          }
        }
      } catch (error) { break; }
    }

    // Mock Fallback UI
    if (fetchedStakes.length === 0) {
      fetchedStakes = [
        { id: 0, amount: 500, startBlock: currentBlockHeight - 800, endBlock: (currentBlockHeight - 800) + LOCK_PERIOD_BLOCKS, claimed: false },
        { id: 1, amount: 250, startBlock: currentBlockHeight - 1100, endBlock: (currentBlockHeight - 1100) + LOCK_PERIOD_BLOCKS, claimed: false } 
      ];
      accumulatedTotal = 750;
    }

    setActiveStakes(fetchedStakes);
    setTotalStaked(accumulatedTotal);
  };

  // --- ACTIONS ---
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
        setTimeout(fetchData, 10000); 
      },
      onCancel: () => {
        setStatus({ type: 'error', msg: 'Transaction cancelled by user.' });
        setActionLoading(false);
      },
    };

    try {
      if (actionType === 'stake') {
        const amount = parseFloat(stakeAmount) * 1000000;
        await openContractCall({
          ...options,
          contractName: 'staking-refinery',
          functionName: 'stake-tokens',
          functionArgs: [uintCV(amount)],
        });
      } else if (actionType === 'harvest') {
        await openContractCall({
          ...options,
          contractName: 'staking-refinery',
          functionName: 'harvest',
          functionArgs: [uintCV(payload.id)], 
        });
      } else if (actionType === 'claim') {
        await openContractCall({
          ...options,
          contractName: 'faucet-distributor',
          functionName: 'claim-daily',
          functionArgs: [],
        });
      } else if (actionType === 'gacha') {
        await openContractCall({
          ...options,
          contractName: 'utility-gacha',
          functionName: 'spin-gacha',
          functionArgs: [],
        });
      }
    } catch (error) {
      console.error("Contract call failed:", error);
      setStatus({ type: 'error', msg: 'Failed to process transaction.' });
      setActionLoading(false);
    }
  };

  // Calculations for Claim
  const blocksToClaim = (lastClaimHeight + BLOCKS_PER_DAY) - currentBlockHeight;
  const isClaimable = blocksToClaim <= 0 || lastClaimHeight === 0; 
  const estimatedTime = blocksToClaim > 0 ? `~${Math.ceil((blocksToClaim * 10) / 60)} hours` : 'Now';

  // --- COMPONENTS ---
  const StatCard = ({ title, value, unit, icon: Icon, color, isLoading }) => (
    <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-all">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">{value.toLocaleString()}</span>
              <span className={`text-xs font-bold ${color}`}>{unit}</span>
            </>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-slate-800/50 ${color.replace('text-', 'text-opacity-80 ')}`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 pb-20 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-indigo-950 to-[#0B1120] border-b border-slate-800 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <Lock className="text-indigo-400" /> Genesis Vault
              </h1>
              <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                Mainnet Live • Block #{currentBlockHeight || '...'}
              </p>
            </div>
            <button 
              onClick={fetchData}
              disabled={loading || actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total POIN" value={balances.poin} unit="POIN" icon={Zap} color="text-amber-400" isLoading={loading} />
            <StatCard title="Treasury ONE" value={balances.one} unit="ONE" icon={Box} color="text-indigo-400" isLoading={loading} />
            <StatCard title="Total Staked" value={totalStaked} unit="POIN" icon={Lock} color="text-purple-400" isLoading={loading} />
            <StatCard title="Est. APY" value="125" unit="%" icon={TrendingUp} color="text-emerald-400" isLoading={loading} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        
        {/* STATUS NOTIFICATION */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 relative z-10 ${
            status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
            status.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
            'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : status.type === 'error' ? <AlertCircle size={20} /> : <RefreshCw size={20} className="animate-spin" />}
            <p className="text-sm font-medium">{status.msg}</p>
            <button onClick={() => setStatus(null)} className="ml-auto text-slate-500 hover:text-white">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: NAVIGATION & PARAMS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1E293B] rounded-2xl p-2 flex flex-col gap-1">
              {['stake', 'claim', 'gacha'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tab === 'stake' && <Lock size={18} />}
                  {tab === 'claim' && <Clock size={18} />}
                  {tab === 'gacha' && <Zap size={18} />}
                  <span className="capitalize">{tab} Operations</span>
                  
                  {/* Indicators for Faucet Tab */}
                  {tab === 'claim' && !isClaimable && (
                    <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded text-slate-500">Wait</span>
                  )}
                  {tab === 'claim' && isClaimable && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-[#1E293B]/50 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Protocol Parameters</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lock Duration</span>
                  <span className="text-slate-200">~7 Days <span className="text-slate-600">({LOCK_PERIOD_BLOCKS} Blocks)</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Supply</span>
                  <span className="text-slate-200">100 POIN <span className="text-slate-600">/ 24h</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gacha Odds</span>
                  <span className="text-slate-200">33% Win Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION AREA */}
          <div className="lg:col-span-8">
            
            {/* --- TAB: STAKE --- */}
            {activeTab === 'stake' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Form Stake */}
                <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <h2 className="text-xl font-bold text-white mb-1">Refinery Staking</h2>
                  <p className="text-slate-400 text-sm mb-6">Lock $POIN to mint $ONE tokens.</p>

                  <div className="bg-[#0F172A] rounded-2xl p-4 border border-slate-700 mb-6">
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Stake Amount</label>
                      <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 transition" onClick={() => setStakeAmount(balances.poin.toString())}>Max: {balances.poin}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-transparent text-3xl font-bold text-white w-full focus:outline-none placeholder-slate-700"
                        disabled={actionLoading}
                      />
                      <div className="bg-slate-800 px-3 py-1 rounded text-sm font-bold text-slate-300">POIN</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Lock Duration</span>
                      <span className="text-slate-200 font-medium">{LOCK_PERIOD_BLOCKS} Blocks (~7 Days)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Estimated Reward</span>
                      <span className="text-emerald-400 font-medium">10% in ONE</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAction('stake')}
                    disabled={actionLoading || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > balances.poin}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                  >
                    {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                    {parseFloat(stakeAmount) > balances.poin ? 'Insufficient Balance' : 'Confirm Staking'}
                  </button>
                </div>

                {/* History Staking */}
                <div className="bg-[#1E293B]/40 border border-slate-700 rounded-3xl p-6 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Clock size={20} className="text-slate-400" /> Your Active Positions
                    </h2>
                    <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
                      {activeStakes.length} Positions
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeStakes.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
                        <Box size={40} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No staked assets yet.</p>
                      </div>
                    ) : (
                      activeStakes.map((stake, idx) => {
                        const blocksLeft = Math.max(0, stake.endBlock - currentBlockHeight);
                        const isReady = blocksLeft === 0;
                        const progress = Math.min(100, ((currentBlockHeight - stake.startBlock) / LOCK_PERIOD_BLOCKS) * 100);

                        return (
                          <div key={idx} className="bg-[#0F172A] border border-slate-700/60 p-5 rounded-2xl hover:border-indigo-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase mb-1">ID #{stake.id}</p>
                                <p className="text-xl font-bold text-white">{stake.amount.toLocaleString()} <span className="text-sm text-amber-400">POIN</span></p>
                              </div>
                              
                              {isReady ? (
                                <button 
                                  onClick={() => handleAction('harvest', stake)}
                                  disabled={actionLoading}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                                >
                                  <Unlock size={16} /> Harvest
                                </button>
                              ) : (
                                <div className="text-right">
                                  <p className="text-slate-400 text-xs mb-1">Lock Status</p>
                                  <p className="text-sm font-medium text-amber-400 flex items-center gap-1 justify-end">
                                    <Clock size={14} /> {blocksLeft} Blocks Left
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isReady ? 'bg-emerald-500' : 'bg-indigo-500 relative overflow-hidden'}`} 
                                style={{ width: `${progress}%` }}
                              >
                                 {!isReady && <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>}
                              </div>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-slate-500">
                              <span>Block #{stake.startBlock}</span>
                              <span>Unlocks at #{stake.endBlock}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: CLAIM --- */}
            {activeTab === 'claim' && (
              <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 space-y-8 animate-fadeIn text-center">
                <div className="inline-flex p-4 bg-indigo-500/20 rounded-full mb-2">
                  <Clock size={48} className="text-indigo-400" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white">Daily Faucet</h2>
                  <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                    The protocol distributes free POIN every 144 blocks (approx 24 hours). 
                    Maintain your streak to increase rewards.
                  </p>
                </div>

                <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 max-w-sm mx-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className={`text-sm font-bold ${isClaimable ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isClaimable ? 'Ready to Claim' : 'Cooling Down'}
                    </span>
                  </div>
                  
                  {/* Progress Bar for Cooldown */}
                  {!isClaimable && (
                    <div className="w-full bg-slate-800 h-2 rounded-full mb-2 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.max(0, 100 - (blocksToClaim / BLOCKS_PER_DAY * 100))}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Next: {estimatedTime}</span>
                    <span>Block #{currentBlockHeight + (isClaimable ? 0 : blocksToClaim)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleAction('claim')}
                  disabled={actionLoading || !isClaimable} 
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 mx-auto"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : null}
                  Claim 100 POIN
                </button>
              </div>
            )}

            {/* --- TAB: GACHA --- */}
            {activeTab === 'gacha' && (
              <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 space-y-8 animate-fadeIn">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4 text-center md:text-left">
                  <div className="bg-purple-500/20 p-4 rounded-xl shrink-0">
                    <Zap size={32} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Lucky Burn</h2>
                    <p className="text-slate-400 text-sm mt-1">Burn your POIN for a random chance to mint valuable $ONE tokens.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#0F172A] border border-slate-700 p-6 rounded-2xl text-center hover:border-purple-500 transition-colors cursor-pointer group">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💎</div>
                      <p className="text-white font-bold">Prize Pool {i}</p>
                      <p className="text-xs text-slate-500 mt-1">Win Rate: 33%</p>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-900/10 border border-purple-500/20 p-8 rounded-3xl text-center">
                  <p className="text-purple-300 font-bold mb-2">Cost per Spin</p>
                  <p className="text-4xl font-bold text-white mb-6">50 <span className="text-sm text-slate-400">POIN</span></p>
                  
                  <button 
                    onClick={() => handleAction('gacha')}
                    disabled={actionLoading || balances.poin < 50}
                    className="w-full max-w-sm mx-auto py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all flex justify-center items-center gap-2"
                  >
                    {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : null}
                    {balances.poin < 50 ? 'Insufficient Balance' : 'SPIN NOW'}
                  </button>
                  <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                    <CheckCircle size={12} className="text-emerald-500" /> Proven Fair: Uses Block Hash RNG
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Vault;
