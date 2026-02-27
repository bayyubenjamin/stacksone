import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { uintCV, PostConditionMode } from '@stacks/transactions';

const NETWORK = new StacksMainnet();
const ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';

export default function Games() {

  const roll = async () => {
    await openContractCall({
      network: NETWORK,
      contractAddress: ADDRESS,
      contractName: 'genesis-lucky-v1',
      functionName: 'roll',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
    });
  };

  const fight = async () => {
    await openContractCall({
      network: NETWORK,
      contractAddress: ADDRESS,
      contractName: 'genesis-duel-v1',
      functionName: 'fight',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
    });
  };

  const predict = async () => {
    await openContractCall({
      network: NETWORK,
      contractAddress: ADDRESS,
      contractName: 'genesis-predict-v1',
      functionName: 'predict',
      functionArgs: [uintCV(7)],
      postConditionMode: PostConditionMode.Allow,
    });
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Genesis Games</h1>
      <button onClick={roll}>🎲 Roll</button>
      <button onClick={fight}>⚔️ Fight</button>
      <button onClick={predict}>🔢 Predict</button>
    </div>
  );
}
