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
    <div className="min-h-screen bg-[#0B1120] text-slate-200 pb-20 font-sans">
      {/* seluruh JSX desain kamu tetap di sini */}
    </div>
  );
};

export default Vault;
