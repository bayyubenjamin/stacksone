import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STACKSONE_MAINNET,
  calculateLevel,
  getContractId,
  getExplorerContractUrl,
  getRankTier,
  getTaskReward,
} from '../index.js';

test('calculateLevel follows the 500 XP progression rule', () => {
  assert.equal(calculateLevel(0), 1);
  assert.equal(calculateLevel(499), 1);
  assert.equal(calculateLevel(500), 2);
  assert.equal(calculateLevel(2000), 5);
});

test('numeric helpers reject invalid values', () => {
  assert.throws(() => calculateLevel(-1), TypeError);
  assert.throws(() => getRankTier(1.5), TypeError);
  assert.throws(() => getTaskReward('not-a-number'), TypeError);
});

test('rank tiers match the documented thresholds', () => {
  assert.equal(getRankTier(99), 0);
  assert.equal(getRankTier(100), 1);
  assert.equal(getRankTier(500), 2);
  assert.equal(getRankTier(1000), 3);
});

test('task rewards expose the canonical frontend mission values', () => {
  assert.equal(getTaskReward(101), 300);
  assert.equal(getTaskReward(110), 1200);
  assert.equal(getTaskReward(999), null);
});

test('contract helpers build canonical mainnet identifiers', () => {
  const contractName = STACKSONE_MAINNET.contracts.core;
  const contractId = getContractId(contractName);

  assert.equal(
    contractId,
    'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.genesis-core-v10',
  );
  assert.equal(
    getExplorerContractUrl(contractName),
    `https://explorer.hiro.so/address/${contractId}?chain=mainnet`,
  );
});
