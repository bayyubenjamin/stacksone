import test from 'node:test';
import assert from 'node:assert/strict';

import { StacksOneClient } from '../index.js';

const ADDRESS = 'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3';

function createClient(overrides = {}) {
  const readOnlyCalls = [];
  const readOnly = async (request) => {
    readOnlyCalls.push(request);

    if (request.functionName === 'get-score') return { score: 725 };
    if (request.functionName === 'get-rank-tier') return 2;
    if (request.functionName === 'is-task-done') return true;
    if (request.functionName === 'get-balance') return { value: 2_500_000 };

    throw new Error(`Unexpected function ${request.functionName}`);
  };

  const fetcher = async (url) => ({
    ok: true,
    status: 200,
    async json() {
      if (url.includes('/user-profile')) return { data: 'profile' };
      if (url.includes('/wallet-has-badge')) return { data: 'badge' };
      throw new Error(`Unexpected URL ${url}`);
    },
  });

  return {
    client: new StacksOneClient({
      network: { coreApiUrl: 'https://api.example.test' },
      readOnly,
      fetcher,
      decode: (value) => value,
      decodeHex: (value) => {
        if (value === 'profile') return { xp: 1250, level: 3 };
        if (value === 'badge') return true;
        return null;
      },
      ...overrides,
    }),
    readOnlyCalls,
  };
}

test('getUserStats composes profile and leaderboard reads', async () => {
  const { client, readOnlyCalls } = createClient();
  const stats = await client.getUserStats(ADDRESS);

  assert.deepEqual(stats, {
    address: ADDRESS,
    xp: 1250,
    level: 3,
    score: 725,
    rankTier: 2,
  });
  assert.deepEqual(
    readOnlyCalls.map(({ functionName }) => functionName),
    ['get-score', 'get-rank-tier'],
  );
});

test('mission and badge reads return normalized booleans', async () => {
  const { client } = createClient();

  assert.equal(await client.isTaskDone(ADDRESS, 101), true);
  assert.equal(await client.hasBadge(ADDRESS, 'genesis'), true);
});

test('token balance selects the canonical contract', async () => {
  const { client, readOnlyCalls } = createClient();

  assert.equal(await client.getTokenBalance(ADDRESS, 'one'), 2_500_000);
  assert.equal(readOnlyCalls[0].contractName, 'token-one');

  await assert.rejects(() => client.getTokenBalance(ADDRESS, 'unknown'), TypeError);
});

test('badge eligibility combines profile rules and ownership', async () => {
  const { client } = createClient();
  const eligibility = await client.checkBadgeEligibility({
    user: ADDRESS,
    badgeId: 'node',
  });

  assert.deepEqual(eligibility, {
    user: ADDRESS,
    badgeId: 'node',
    owned: true,
    eligible: false,
    profile: { xp: 1250, level: 3 },
    requirements: {
      minXP: 500,
      minLevel: 2,
      xpMet: true,
      levelMet: true,
    },
  });
});

test('map entry 404 is treated as an empty on-chain record', async () => {
  const { client } = createClient({
    fetcher: async () => ({ ok: false, status: 404 }),
  });

  assert.deepEqual(await client.getUserProfile(ADDRESS), { xp: 0, level: 1 });
});

test('invalid input fails before any network request', async () => {
  const { client } = createClient();

  await assert.rejects(() => client.getUserStats('invalid'), TypeError);
  await assert.rejects(
    () => client.checkBadgeEligibility({ user: ADDRESS, badgeId: 'missing' }),
    RangeError,
  );
});
