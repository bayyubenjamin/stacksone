"use client";

import { useState } from "react";
import {
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV,
  standardPrincipalCV
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

const CONTRACT_ADDRESS = "PASTE_YOUR_MAINNET_ADDRESS";
const CONTRACT_NAME = "genesis-leaderboard-v1";

const network = new StacksMainnet();

export default function LeaderboardCard({ userAddress }: { userAddress: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [tier, setTier] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchScore() {
    setLoading(true);

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-score",
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress,
    });

    const tierResult = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-rank-tier",
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress,
    });

    // @ts-ignore
    setScore(Number(result.value.data.score.value));
    // @ts-ignore
    setTier(Number(tierResult.value));

    setLoading(false);
  }

  async function addScore() {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "add-score",
      functionArgs: [uintCV(10)],
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      network,
    };

    await makeContractCall(txOptions);
  }

  return (
    <div className="p-4 border rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Genesis Leaderboard</h2>

      <button
        onClick={fetchScore}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-2"
      >
        {loading ? "Loading..." : "Fetch My Score"}
      </button>

      <button
        onClick={addScore}
        className="px-4 py-2 bg-green-500 text-white rounded-lg mb-4"
      >
        Add +10 Score
      </button>

      {score !== null && (
        <div>
          <p><strong>Score:</strong> {score}</p>
          <p><strong>Rank Tier:</strong> {tier}</p>
        </div>
      )}
    </div>
  );
}
