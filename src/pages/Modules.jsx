import React, { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { uintCV, standardPrincipalCV, PostConditionMode, callReadOnlyFunction } from '@stacks/transactions';

const network = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';

const Modules = ({ userData }) => {

  const [counter, setCounter] = useState(0);
  const [flag, setFlag] = useState(false);
  const [points, setPoints] = useState(0);
  const [badge, setBadge] = useState(false);
  const [score, setScore] = useState(0);

  const wallet = userData?.profile?.stxAddress?.mainnet;

  if (!wallet) return <div>Connect wallet to use modules.</div>;

  const fetchValue = async (contractName, functionName, setter) => {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      functionName,
      functionArgs: [standardPrincipalCV(wallet)],
      network,
      senderAddress: wallet
    });

    if (result?.value?.value !== undefined) {
      setter(Number(result.value.value));
    } else if (result?.value?.data) {
      const firstKey = Object.keys(result.value.data)[0];
      setter(Number(result.value.data[firstKey].value));
    }
  };

  const callWrite = async (contractName, functionName, args = []) => {
    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      functionName,
      functionArgs: args,
      postConditionMode: PostConditionMode.Allow
    });
  };

  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-bold">🧪 Modular Lab</h2>

      {/* Counter */}
      <div className="border p-4 rounded">
        <h3>Counter</h3>
        <button onClick={() => callWrite('genesis-counter-v1', 'increment')}>
          Increment
        </button>
        <button onClick={() => fetchValue('genesis-counter-v1', 'get-count', setCounter)}>
          Refresh
        </button>
        <p>Value: {counter}</p>
      </div>

      {/* Flag */}
      <div className="border p-4 rounded">
        <h3>Flag Toggle</h3>
        <button onClick={() => callWrite('genesis-flag-v1', 'toggle')}>
          Toggle
        </button>
        <button onClick={() => fetchValue('genesis-flag-v1', 'get-flag', setFlag)}>
          Refresh
        </button>
        <p>Status: {flag ? "True" : "False"}</p>
      </div>

      {/* Points */}
      <div className="border p-4 rounded">
        <h3>Points</h3>
        <button onClick={() => callWrite('genesis-points-v1', 'add', [uintCV(10)])}>
          Add +10
        </button>
        <button onClick={() => fetchValue('genesis-points-v1', 'get-points', setPoints)}>
          Refresh
        </button>
        <p>Total: {points}</p>
      </div>

      {/* Badge Lite */}
      <div className="border p-4 rounded">
        <h3>Badge Lite</h3>
        <button onClick={() => callWrite('genesis-badge-lite-v1', 'claim')}>
          Claim
        </button>
        <button onClick={() => fetchValue('genesis-badge-lite-v1', 'has-badge', setBadge)}>
          Refresh
        </button>
        <p>Claimed: {badge ? "Yes" : "No"}</p>
      </div>

      {/* Score Lite */}
      <div className="border p-4 rounded">
        <h3>Score Lite</h3>
        <button onClick={() => callWrite('genesis-score-lite-v1', 'add-score', [uintCV(15)])}>
          Add +15
        </button>
        <button onClick={() => fetchValue('genesis-score-lite-v1', 'get-score', setScore)}>
          Refresh
        </button>
        <p>Score: {score}</p>
      </div>

    </div>
  );
};

export default Modules;
