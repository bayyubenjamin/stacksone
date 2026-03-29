import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network'; 
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  uintCV,
  cvToHex,
  hexToCV,
  tupleCV,
  PostConditionMode
} from '@stacks/transactions';
import { userSession } from '../supabaseClient'; 
import { CheckCircle, Clock, Zap, Box, Lock, TrendingUp, RefreshCw, AlertCircle, Unlock } from 'lucide-react';

// --- CONFIGURATION V7 ---
const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3'; 
const BLOCKS_PER_DAY = 144;
const LOCK_PERIOD_BLOCKS = 1008; 

const HIRO_API_URL = 'https://api.mainnet.hiro.so';

const Vault = () => {
  const [balances, setBalances] = useState({ poin: 0, one: 0 });
  const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
  const [faucetData, setFaucetData] = useState({ blocksLeft: 0, nextClaimBlock: 0, isPending: false }); 
  const [activeStakes, setActiveStakes] = useState([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [status, setStatus] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [actionLoading, setActionLoading] = useState(false); 
  const [now, setNow] = useState(Date.now());
  
  const network = new StacksMainnet({ url: HIRO_API_URL });

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedSinceBlock = useMemo(() => {
    return Math.floor((now - Date.now()) / 1000);
  }, [now]);

  const fetchNetworkStatus = async () => {
    try {
      const response = await fetch(`${HIRO_API_URL}/v2/info`);
      const data = await response.json();
      if (data.burn_block_height) {
        setCurrentBlockHeight(data.burn_block_height);
      }
    } catch (e) {
      console.error("Failed to load block height", e);
    }
  };

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
    fetchNetworkStatus();
    // INTERVAL DIHAPUS SESUAI PERMINTAAN AGAR TIDAK BERAT
  }, []);

  useEffect(() => {
    if (currentBlockHeight > 0) fetchData();
  }, [currentBlockHeight, fetchData]);

  // Ekstraksi CV Manual (Anti-NaN)
  const extractUintCV = (cv) => {
    if (!cv) return 0;
    if (cv.type === 7) return Number(cv.value.value); // (ok uX)
    if (cv.type === 1) return Number(cv.value); // uX
    return 0;
  };

  const fetchBalances = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;

    try {
      const [poinData, oneData] = await Promise.all([
        callReadOnlyFunction({ contractAddress: CONTRACT_ADDRESS, contractName: 'token-poin-v7', functionName: 'get-balance', functionArgs: [standardPrincipalCV(userAddress)], network, senderAddress: userAddress }),
        callReadOnlyFunction({ contractAddress: CONTRACT_ADDRESS, contractName: 'token-one-v7', functionName: 'get-balance', functionArgs: [standardPrincipalCV(userAddress)], network, senderAddress: userAddress })
      ]);
      
      setBalances({
        poin: extractUintCV(poinData) / 1000000,
        one: extractUintCV(oneData) / 1000000
      });
    } catch (e) { console.error("Failed to load balances", e); }
  };

  const fetchFaucetData = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;

    try {
      const resultCV = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'faucet-distributor-v7',
        functionName: 'get-user-status',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      
      let blocksLeft = 0;
      let nextClaimBlock = 0;
      let isPending = false;

      // PARSING TUPLE SANGAT AMAN
      const tupleData = resultCV?.type === 7 ? resultCV.value.data : resultCV?.data;
      
      if (tupleData) {
         if (tupleData['blocks-left']) blocksLeft = Number(tupleData['blocks-left'].value);
         if (tupleData['next-claim-block']) nextClaimBlock = Number(tupleData['next-claim-block'].value);
      }

      if (isNaN(blocksLeft)) blocksLeft = 0;
      if (isNaN(nextClaimBlock)) nextClaimBlock = 0;

      // CEK MEMPOOL
      if (blocksLeft === 0) {
        try {
          const mempoolRes = await fetch(`${HIRO_API_URL}/extended/v1/tx/mempool?sender_address=${userAddress}`);
          if (mempoolRes.ok) {
            const mempoolData = await mempoolRes.json();
            const isClaimPending = mempoolData.results?.some(tx => 
              tx.tx_status === "pending" && 
              tx.tx_type === "contract_call" && 
              tx.contract_call.contract_id === `${CONTRACT_ADDRESS}.faucet-distributor-v7` &&
              tx.contract_call.function_name === "claim"
            );
            if (isClaimPending) isPending = true;
          }
        } catch (mempoolErr) { console.warn("Mempool check failed", mempoolErr); }
      }
      
      setFaucetData({ blocksLeft, nextClaimBlock, isPending });
    } catch (e) { console.error("Failed to fetch faucet data", e); }
  };

  const fetchStakingHistory = async () => {
    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;
    const userAddress = userData.profile.stxAddress.mainnet;
    
    let fetchedStakes = [];
    let accumulatedTotal = 0;
    let maxId = 0; 

    try {
      const nonceRes = await fetch(`${HIRO_API_URL}/v2/data_var/${CONTRACT_ADDRESS}/staking-refinery-v7/nonce`);
      if (nonceRes.ok) {
        const nonceData = await nonceRes.json();
        const nonceCV = hexToCV(nonceData.data);
        maxId = Number(nonceCV.value);
        if (isNaN(maxId)) maxId = 0;
      }
    } catch (e) { console.warn("Failed to fetch nonce", e); }

    for (let i = 0; i < maxId; i++) {
      try {
        const keyCV = tupleCV({ user: standardPrincipalCV(userAddress), id: uintCV(i) });
        const res = await fetch(`${HIRO_API_URL}/v2/map_entry/${CONTRACT_ADDRESS}/staking-refinery-v7/stakes`, {
          method: 'POST',
          body: JSON.stringify(cvToHex(keyCV)),
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data !== "0x09") { // 0x09 = OptionalNone
            const valCV = hexToCV(data.data);
            
            if (valCV.type === 9) { // 9 = OptionalSome
              const tupleData = valCV.value.data;
              const claimed = tupleData.claimed.type === 3; // 3 = True
              
              if (!claimed) {
                const amountVal = Number(tupleData.amount.value);
                const startBlock = Number(tupleData.start.value);
                const endBlock = Number(tupleData.end.value);
                
                fetchedStakes.push({ 
                  id: i, 
                  amount: amountVal / 1000000, 
                  startBlock: startBlock, 
                  endBlock: endBlock, 
                  claimed: false 
                });
                accumulatedTotal += (amountVal / 1000000);
              }
            }
          }
        }
      } catch (error) { console.error(`Error stake ${i}`, error); }
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
        
        if (actionType === 'claim') {
           localStorage.setItem('faucet_pending_start', Date.now().toString());
           setFaucetData(prev => ({ ...prev, isPending: true }));
        }
        else if (actionType === 'harvest' && payload) setActiveStakes(prev => prev.filter(s => s.id !== payload.id));
        else if (actionType === 'stake') {
          const amountStaked = parseFloat(stakeAmount);
          if (!isNaN(amountStaked)) setBalances(prev => ({ ...prev, poin: prev.poin - amountStaked }));
          setStakeAmount('');
        }
      },
      onCancel: () => {
        setStatus({ type: 'error', msg: 'Transaction cancelled by user.' });
        setActionLoading(false);
      },
    };

    try {
      if (actionType === 'stake') await openContractCall({ ...options, contractName: 'staking-refinery-v7', functionName: 'stake', functionArgs: [uintCV(parseFloat(stakeAmount) * 1000000)] });
      else if (actionType === 'harvest') await openContractCall({ ...options, contractName: 'staking-refinery-v7', functionName: 'harvest', functionArgs: [uintCV(payload.id)] });
      else if (actionType === 'claim') await openContractCall({ ...options, contractName: 'faucet-distributor-v7', functionName: 'claim', functionArgs: [] });
      else if (actionType === 'gacha') await openContractCall({ ...options, contractName: 'utility-gacha', functionName: 'spin-gacha', functionArgs: [] });
    } catch (error) {
      console.error("Contract call failed:", error);
      setStatus({ type: 'error', msg: 'Failed to process transaction.' });
      setActionLoading(false);
    }
  };

  let faucetSecondsLeft = 0;
  
  useEffect(() => {
    if (faucetData.isPending) {
      if (!localStorage.getItem('faucet_pending_start')) localStorage.setItem('faucet_pending_start', Date.now().toString());
    } else if (faucetData.blocksLeft > 0) {
      localStorage.removeItem('faucet_pending_start');
      const savedTargetBlock = localStorage.getItem('faucet_target_block');
      if (savedTargetBlock !== faucetData.nextClaimBlock.toString()) {
        const targetDate = Date.now() + (faucetData.blocksLeft * 600 * 1000);
        localStorage.setItem('faucet_target_block', faucetData.nextClaimBlock.toString());
        localStorage.setItem('faucet_target_time', targetDate.toString());
      }
    } else {
      localStorage.removeItem('faucet_target_block');
      localStorage.removeItem('faucet_target_time');
      localStorage.removeItem('faucet_pending_start');
    }
  }, [faucetData.isPending, faucetData.blocksLeft, faucetData.nextClaimBlock]);

  if (faucetData.isPending) {
    const start = Number(localStorage.getItem('faucet_pending_start')) || Date.now();
    const elapsed = Math.floor((now - start) / 1000);
    faucetSecondsLeft = Math.max(0, (BLOCKS_PER_DAY * 600) - elapsed);
  } else if (faucetData.blocksLeft > 0) {
    const targetTime = Number(localStorage.getItem('faucet_target_time'));
    if (targetTime) {
      faucetSecondsLeft = Math.max(0, Math.floor((targetTime - now) / 1000));
    } else {
      faucetSecondsLeft = faucetData.blocksLeft * 600;
    }
  }

  const isClaimable = faucetData.blocksLeft === 0 && !faucetData.isPending; 

  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return 'Ready';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const StatCard = ({ title, value, unit, icon: Icon, color, isLoading }) => (
    <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-all">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">{isNaN(value) ? '0' : Number(value).toLocaleString()}</span>
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
      <div className="bg-gradient-to-r from-indigo-950 to-[#0B1120] border-b border-slate-800 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <Lock className="text-indigo-400" /> Genesis Vault V7
              </h1>
              <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                Mainnet Live • Block #{currentBlockHeight || '...'}
              </p>
            </div>
            
            {/* INI BAGIAN YANG DIUBAH: Pake window.location.reload() */}
            <button 
              onClick={() => window.location.reload()} 
              disabled={actionLoading} 
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Reload Page
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

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {status && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 relative z-10 ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : status.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : status.type === 'error' ? <AlertCircle size={20} /> : <RefreshCw size={20} className="animate-spin" />}
            <p className="text-sm font-medium">{status.msg}</p>
            <button onClick={() => setStatus(null)} className="ml-auto text-slate-500 hover:text-white">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-5 bg-[#1E293B] border border-slate-700 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="mb-8">
              <div className="inline-flex p-3 bg-indigo-500/20 rounded-xl mb-4"><Clock size={28} className="text-indigo-400" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Daily Faucet</h2>
              <p className="text-slate-400 text-sm leading-relaxed">The protocol distributes free <span className="text-amber-400 font-bold">100 POIN</span> every 144 blocks (approx 24 hours). Claim daily to maintain your protocol streak!</p>
            </div>

            <div>
              <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${isClaimable ? 'bg-emerald-500/20 text-emerald-400' : faucetData.isPending ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {isClaimable ? 'Ready to Claim' : faucetData.isPending ? 'Pending in Mempool' : 'Cooling Down'}
                  </span>
                </div>
                {!isClaimable && (
                  <div className="w-full bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, 100 - (faucetSecondsLeft / (BLOCKS_PER_DAY * 600) * 100))}%` }}></div>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                  <span>Wait: {isClaimable ? 'Now' : formatTime(faucetSecondsLeft)}</span>
                  <span>Target Burn Block #{faucetData.nextClaimBlock || '...'}</span>
                </div>
              </div>

              <button 
                onClick={() => handleAction('claim')}
                disabled={loading || actionLoading || !isClaimable} 
                className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 ${
                  isClaimable ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 border-2 border-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : (isClaimable ? <Zap size={18} /> : <Clock size={18} />)}
                {isClaimable ? 'Claim 100 POIN' : faucetData.isPending ? 'Awaiting Confirmation...' : `Cooldown (${formatTime(faucetSecondsLeft)})`}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#1E293B] border border-slate-700 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none"></div>
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl"><Lock size={24} className="text-purple-400" /></div>
                <div><h2 className="text-xl font-bold text-white">Refinery Staking</h2><p className="text-slate-400 text-sm">Lock $POIN to mint $ONE tokens.</p></div>
             </div>

            <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-700 mb-6 focus-within:border-purple-500 transition-colors">
              <div className="flex justify-between mb-3">
                <label className="text-xs font-semibold text-slate-400 uppercase">Amount to Stake</label>
                <span className="text-xs text-purple-400 cursor-pointer hover:text-purple-300 font-medium transition" onClick={() => setStakeAmount(balances.poin.toString())}>Max: {balances.poin.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-4xl font-bold text-white w-full focus:outline-none placeholder-slate-800" disabled={actionLoading} />
                <div className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-slate-300 border border-slate-700">POIN</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-700/50">
                <span className="block text-slate-500 text-xs uppercase mb-1">Lock Duration</span>
                <span className="text-slate-200 font-medium text-sm">{LOCK_PERIOD_BLOCKS} Blocks (~7 Days)</span>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-emerald-900/30">
                <span className="block text-slate-500 text-xs uppercase mb-1">Yield Estimate</span>
                <span className="text-emerald-400 font-bold text-sm">10% in ONE Token</span>
              </div>
            </div>

            <button onClick={() => handleAction('stake')} disabled={loading || actionLoading || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > balances.poin} className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
              {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
              {parseFloat(stakeAmount) > balances.poin ? 'Insufficient POIN Balance' : 'Confirm Staking'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#1E293B]/60 border border-slate-700 rounded-3xl p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Clock size={18} className="text-slate-400" /> Active Positions</h2>
              <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 font-medium">{activeStakes.length} Positions</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {activeStakes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                  <Box size={40} className="text-slate-700 mb-3" />
                  <p className="text-slate-500 font-medium text-sm">No active staking positions.</p>
                </div>
              ) : (
                activeStakes.map((stake, idx) => {
                  const blocksLeft = Math.max(0, stake.endBlock - currentBlockHeight);
                  let stakeSecondsLeft = (blocksLeft * 600) - elapsedSinceBlock;
                  if (stakeSecondsLeft < 0) stakeSecondsLeft = 0;
                  
                  const isReady = stakeSecondsLeft <= 0;
                  const progress = Math.min(100, ((currentBlockHeight - stake.startBlock) / LOCK_PERIOD_BLOCKS) * 100);

                  return (
                    <div key={idx} className="bg-[#0F172A] border border-slate-700/80 p-5 rounded-2xl hover:border-purple-500/50 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Receipt #{stake.id}</p>
                          <p className="text-xl font-bold text-white">{isNaN(stake.amount) ? '0' : stake.amount.toLocaleString()} <span className="text-sm text-amber-400 font-medium">POIN</span></p>
                        </div>
                        
                        <button 
                          onClick={() => handleAction('harvest', stake)}
                          disabled={loading || actionLoading || !isReady}
                          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                            isReady ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95 cursor-pointer' : 'bg-slate-800 text-slate-500 border-2 border-slate-700 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {isReady ? <><Unlock size={16} /> Harvest</> : <><Lock size={14} /> Locked ({formatTime(stakeSecondsLeft)})</>}
                        </button>
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isReady ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-purple-500 relative overflow-hidden'}`} style={{ width: `${progress}%` }}>
                           {!isReady && <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>}
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500">
                        <span>Start: #{stake.startBlock}</span>
                        <span>Unlock: #{stake.endBlock}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-3xl p-6 flex flex-col justify-center text-center">
            <div className="bg-purple-500/10 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20"><Zap size={28} className="text-purple-400" /></div>
            <h2 className="text-xl font-bold text-white mb-2">Lucky Burn Module</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">Burn your surplus POIN for a 33% random chance to mint valuable $ONE tokens.</p>
            <div className="bg-[#0B1120] border border-slate-700 p-5 rounded-2xl mb-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Cost per Spin</p>
              <p className="text-3xl font-bold text-white">50 <span className="text-sm text-amber-400">POIN</span></p>
            </div>
            <button onClick={() => handleAction('gacha')} disabled={loading || actionLoading || balances.poin < 50} className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 border border-purple-500/50 disabled:border-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2">
              {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : '🎲'}
              {balances.poin < 50 ? 'Insufficient Balance' : 'SPIN GACHA'}
            </button>
            <p className="text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1 uppercase tracking-widest font-bold"><CheckCircle size={10} className="text-emerald-500" /> On-Chain RNG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
