export { StacksOneClient } from './sdk/client.js';
export {
  BADGE_CATALOG,
  MISSION_CATALOG,
  STACKSONE_MAINNET,
  getContractId,
  getMission,
  getTaskReward,
} from './sdk/contracts.js';
export { resolveStacksNetwork } from './sdk/network.js';
export {
  assertStacksAddress,
  calculateLevel,
  getRankTier,
  normalizeProfile,
  toBoolean,
  toSafeNumber,
} from './sdk/utils.js';

import {
  MISSION_CATALOG,
  STACKSONE_MAINNET,
  getContractId,
} from './sdk/contracts.js';

export const STACKSONE_TASK_REWARDS = Object.freeze(
  Object.fromEntries(MISSION_CATALOG.map(({ id, reward }) => [id, reward])),
);

export function getExplorerContractUrl(
  contractName,
  deployer = STACKSONE_MAINNET.deployer,
) {
  return `https://explorer.hiro.so/address/${getContractId(contractName, deployer)}?chain=mainnet`;
}
