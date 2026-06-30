const freezeList = (items) => Object.freeze(items.map((item) => Object.freeze(item)));

export const STACKSONE_MAINNET = Object.freeze({
  network: 'mainnet',
  deployer: 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3',
  contracts: Object.freeze({
    core: 'genesis-core-v10',
    missions: 'genesis-missions-v10',
    badges: 'genesis-badges-v10',
    leaderboard: 'genesis-leaderboard-v1',
    boost: 'genesis-boost-v1',
    chainTap: 'chaintap',
    tokenPoin: 'token-poin',
    tokenOne: 'token-one',
  }),
});

export const MISSION_CATALOG = freezeList([
  {
    id: 101,
    name: 'Security Audit Sentinel',
    desc: 'Perform a comprehensive vulnerability scan on the smart contracts',
    reward: 300,
    icon: '🛡️',
  },
  {
    id: 102,
    name: 'SIP Implementation',
    desc: 'Implement a new Stacks Improvement Proposal (SIP) standard in your app',
    reward: 450,
    icon: '📜',
  },
  {
    id: 103,
    name: 'Gasless Transaction Setup',
    desc: 'Enable meta-transactions to allow users to interact without STX gas fees',
    reward: 220,
    icon: '⛽',
  },
  {
    id: 104,
    name: 'DeFi Liquidity Provider',
    desc: 'Provide liquidity to a Stacks-based DEX using your Diamond assets',
    reward: 190,
    icon: '💧',
  },
  {
    id: 105,
    name: 'Identity Recovery Protocol',
    desc: 'Set up a social recovery mechanism for your decentralized identity',
    reward: 280,
    icon: '🔑',
  },
  {
    id: 106,
    name: 'Multi-sig Governance',
    desc: 'Deploy a multi-signature wallet for shared project treasury management',
    reward: 320,
    icon: '👥',
  },
  {
    id: 107,
    name: 'Zero-Knowledge Proofs',
    desc: 'Integrate ZK-proofs for private identity verification on-chain',
    reward: 550,
    icon: '🕵️',
  },
  {
    id: 108,
    name: 'Community Workshop Lead',
    desc: 'Host a technical workshop for new developers joining the Genesis ecosystem',
    reward: 250,
    icon: '🎓',
  },
  {
    id: 109,
    name: 'Cross-chain Bridge Test',
    desc: 'Successfully bridge assets from Ethereum to Stacks via an official portal',
    reward: 210,
    icon: '🌉',
  },
  {
    id: 110,
    name: 'Genesis Overlord',
    desc: 'Consolidate 10 high-tier Diamond Vaults into a single Master Node',
    reward: 1200,
    icon: '👑',
  },
]);

export const BADGE_CATALOG = freezeList([
  {
    id: 'genesis',
    title: 'Genesis Pioneer',
    subtitle: 'Phase 1 Access',
    reqText: 'Awarded to early protocol adopters. Requires Level 1.',
    icon: '✧',
    minLevel: 1,
    minXP: 0,
  },
  {
    id: 'node',
    title: 'Node Operator',
    subtitle: 'Consistency Tier',
    reqText: 'Requires Level 2 and 500 XP. Validate your commitment via protocol synchronization.',
    icon: '⎈',
    minLevel: 2,
    minXP: 500,
  },
  {
    id: 'guardian',
    title: 'Protocol Guardian',
    subtitle: 'Elite Status',
    reqText: 'Requires Level 5 and 2000 XP. The highest honor for users who have secured the genesis protocol.',
    icon: '⛨',
    minLevel: 5,
    minXP: 2000,
  },
]);

export function getContractId(contractName, deployer = STACKSONE_MAINNET.deployer) {
  if (typeof contractName !== 'string' || contractName.trim() === '') {
    throw new TypeError('contractName must be a non-empty string');
  }

  if (typeof deployer !== 'string' || deployer.trim() === '') {
    throw new TypeError('deployer must be a non-empty string');
  }

  return `${deployer.trim()}.${contractName.trim()}`;
}

export function getMission(taskId) {
  const normalizedTaskId = Number(taskId);
  return MISSION_CATALOG.find((mission) => mission.id === normalizedTaskId) ?? null;
}

export function getTaskReward(taskId) {
  return getMission(taskId)?.reward ?? null;
}
