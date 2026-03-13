import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { CheckCircle, Clock, Zap, Box, Lock, TrendingUp, RefreshCw, AlertCircle, Unlock } from 'lucide-react';

const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';

const CONTRACTS = {
  POIN: 'token-poin-v4',
  ONE: 'token-one-v4',
  FAUCET: 'faucet-distributor-v4',
  STAKING: 'staking-refinery-v4'
};

const BLOCK_TIME_SECONDS = 600;

const Vault = () => {

  const [balances, setBalances] = useState({ poin: 0, one: 0 });

  const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
  const [faucetStatus, setFaucetStatus] = useState(null);

  const [activeStakes, setActiveStakes] = useState([]);

  const [stakeAmount, setStakeAmount] = useState('');
  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const network = new StacksMainnet();

  const fetchNetworkStatus = async () => {
    try {
      const res = await fetch(`${network.coreApiUrl}/v2/info`);
      const data = await res.json();
      setCurrentBlockHeight(data.stacks_tip_height);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBalances = async () => {

    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;

    const userAddress = userData.profile.stxAddress.mainnet;

    try {

      const [poin, one] = await Promise.all([
        callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACTS.POIN,
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(userAddress)],
          network,
          senderAddress: userAddress
        }),
        callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACTS.ONE,
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(userAddress)],
          network,
          senderAddress: userAddress
        })
      ]);

      setBalances({
        poin: Number(cvToValue(poin).value) / 1000000,
        one: Number(cvToValue(one).value) / 1000000
      });

    } catch (e) {
      console.error(e);
    }
  };

  const fetchFaucetStatus = async () => {

    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;

    const userAddress = userData.profile.stxAddress.mainnet;

    try {

      const res = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.FAUCET,
        functionName: 'get-user-status',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });

      const data = cvToValue(res);

      setFaucetStatus(data);

    } catch (e) {
      console.error(e);
    }
  };

  const fetchStakes = async () => {

    const userData = userSession.loadUserData();
    if (!userData?.profile?.stxAddress) return;

    const userAddress = userData.profile.stxAddress.mainnet;

    let stakes = [];

    for (let i = 0; i < 20; i++) {

      try {

        const res = await callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACTS.STAKING,
          functionName: 'get-stake-status',
          functionArgs: [
            standardPrincipalCV(userAddress),
            uintCV(i)
          ],
          network,
          senderAddress: userAddress
        });

        const val = cvToValue(res);

        if (val.start !== 0 && !val.claimed) {

          stakes.push({
            id: i,
            startBlock: Number(val.start),
            endBlock: Number(val.end),
            blocksLeft: Number(val['blocks-left'])
          });

        }

      } catch {}

    }

    setActiveStakes(stakes);

  };

  const fetchData = useCallback(async () => {

    if (!userSession.isUserSignedIn()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    await fetchNetworkStatus();

    await Promise.all([
      fetchBalances(),
      fetchFaucetStatus(),
      fetchStakes()
    ]);

    setLoading(false);

  }, []);

  useEffect(() => {

    fetchData();

    const interval = setInterval(fetchNetworkStatus, 60000);

    return () => clearInterval(interval);

  }, []);

  const handleAction = async (action, payload = null) => {

    const userData = userSession.loadUserData();
    const userAddress = userData.profile.stxAddress.mainnet;

    setActionLoading(true);

    try {

      if (action === 'claim') {

        await openContractCall({
          network,
          anchorMode: 1,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACTS.FAUCET,
          functionName: 'claim',
          functionArgs: [],
          postConditionMode: PostConditionMode.Allow
        });

      }

      if (action === 'stake') {

        await openContractCall({
          network,
          anchorMode: 1,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACTS.STAKING,
          functionName: 'stake',
          functionArgs: [uintCV(parseFloat(stakeAmount) * 1000000)],
          postConditionMode: PostConditionMode.Allow
        });

      }

      if (action === 'harvest') {

        await openContractCall({
          network,
          anchorMode: 1,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACTS.STAKING,
          functionName: 'harvest',
          functionArgs: [uintCV(payload.id)],
          postConditionMode: PostConditionMode.Allow
        });

      }

      setTimeout(fetchData, 8000);

    } catch (e) {
      console.error(e);
    }

    setActionLoading(false);

  };

  const formatTime = (blocks) => {

    const seconds = blocks * BLOCK_TIME_SECONDS;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    return `${h}h ${m}m`;

  };

  if (loading) {
    return <div className="p-10 text-center text-white">Loading Vault...</div>
  }

  const faucetReady = faucetStatus?.['can-claim'];

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl mb-6">Genesis Vault V4</h1>

      <div className="mb-6">
        <div>POIN: {balances.poin}</div>
        <div>ONE: {balances.one}</div>
      </div>

      <button
        onClick={() => handleAction('claim')}
        disabled={!faucetReady || actionLoading}
      >
        {faucetReady ? 'Claim Faucet' : 'Cooldown'}
      </button>

      <div className="mt-8">

        <input
          value={stakeAmount}
          onChange={(e)=>setStakeAmount(e.target.value)}
          placeholder="POIN amount"
        />

        <button
          onClick={()=>handleAction('stake')}
          disabled={actionLoading}
        >
          Stake
        </button>

      </div>

      <div className="mt-10">

        {activeStakes.map(s=>(
          <div key={s.id}>

            <div>Stake #{s.id}</div>
            <div>Unlock in {formatTime(s.blocksLeft)}</div>

            <button
              disabled={s.blocksLeft > 0}
              onClick={()=>handleAction('harvest', s)}
            >
              Harvest
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Vault;
