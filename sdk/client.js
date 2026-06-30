import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  callReadOnlyFunction,
  cvToHex,
  cvToValue,
  hexToCV,
  standardPrincipalCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

import { BADGE_CATALOG, STACKSONE_MAINNET } from './contracts.js';
import { resolveStacksNetwork } from './network.js';
import {
  assertStacksAddress,
  normalizeProfile,
  toBoolean,
  toSafeNumber,
} from './utils.js';

const DEFAULT_APP_DETAILS = Object.freeze({
  name: 'StacksOne',
  icon: '/logo.png',
});

export class StacksOneClient {
  constructor(options = {}) {
    this.network = resolveStacksNetwork(options.network ?? 'mainnet');
    this.deployer = options.deployer ?? STACKSONE_MAINNET.deployer;
    this.contracts = Object.freeze({
      ...STACKSONE_MAINNET.contracts,
      ...(options.contracts ?? {}),
    });
    this.appDetails = Object.freeze({
      ...DEFAULT_APP_DETAILS,
      ...(options.appDetails ?? {}),
    });
    this.readOnly = options.readOnly ?? callReadOnlyFunction;
    this.fetcher = options.fetcher ?? globalThis.fetch?.bind(globalThis);
    this.decode = options.decode ?? cvToValue;
    this.decodeHex = options.decodeHex ?? ((value) => cvToValue(hexToCV(value)));
    this.userSession = options.userSession ?? null;
  }

  async callReadOnly(contractName, functionName, functionArgs, senderAddress) {
    const sender = assertStacksAddress(senderAddress);

    if (typeof contractName !== 'string' || contractName.trim() === '') {
      throw new TypeError('contractName must be a non-empty string');
    }

    if (typeof functionName !== 'string' || functionName.trim() === '') {
      throw new TypeError('functionName must be a non-empty string');
    }

    if (!Array.isArray(functionArgs)) {
      throw new TypeError('functionArgs must be an array');
    }

    return this.readOnly({
      contractAddress: this.deployer,
      contractName: contractName.trim(),
      functionName: functionName.trim(),
      functionArgs,
      network: this.network,
      senderAddress: sender,
    });
  }

  async readMapEntry(contractName, mapName, key) {
    if (!this.fetcher) {
      throw new Error('No fetch implementation is available');
    }

    const response = await this.fetcher(
      `${this.network.coreApiUrl}/v2/map_entry/${this.deployer}/${contractName}/${mapName}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvToHex(key)),
      },
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Stacks API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return payload?.data ? this.decodeHex(payload.data) : null;
  }

  async getUserProfile(address) {
    const user = assertStacksAddress(address);
    const value = await this.readMapEntry(
      this.contracts.core,
      'user-profile',
      standardPrincipalCV(user),
    );

    return normalizeProfile(value);
  }

  async getLeaderboardScore(address) {
    const user = assertStacksAddress(address);
    const result = await this.callReadOnly(
      this.contracts.leaderboard,
      'get-score',
      [standardPrincipalCV(user)],
      user,
    );
    const decoded = this.decode(result);

    return toSafeNumber(decoded?.score ?? decoded?.data?.score ?? decoded, 0);
  }

  async getRankTier(address) {
    const user = assertStacksAddress(address);
    const result = await this.callReadOnly(
      this.contracts.leaderboard,
      'get-rank-tier',
      [standardPrincipalCV(user)],
      user,
    );

    return toSafeNumber(this.decode(result), 0);
  }

  async getTokenBalance(address, token = 'one') {
    const user = assertStacksAddress(address);
    const contractName = token === 'poin'
      ? this.contracts.tokenPoin
      : token === 'one'
        ? this.contracts.tokenOne
        : null;

    if (!contractName) {
      throw new TypeError('token must be "one" or "poin"');
    }

    const result = await this.callReadOnly(
      contractName,
      'get-balance',
      [standardPrincipalCV(user)],
      user,
    );

    return toSafeNumber(this.decode(result), 0);
  }

  async isTaskDone(address, taskId) {
    const user = assertStacksAddress(address);
    const normalizedTaskId = Number(taskId);

    if (!Number.isSafeInteger(normalizedTaskId) || normalizedTaskId < 0) {
      throw new TypeError('taskId must be a non-negative safe integer');
    }

    const result = await this.callReadOnly(
      this.contracts.missions,
      'is-task-done',
      [standardPrincipalCV(user), uintCV(normalizedTaskId)],
      user,
    );

    return toBoolean(this.decode(result), false);
  }

  async hasBadge(address, badgeId) {
    const user = assertStacksAddress(address);

    if (typeof badgeId !== 'string' || badgeId.trim() === '') {
      throw new TypeError('badgeId must be a non-empty string');
    }

    const value = await this.readMapEntry(
      this.contracts.core,
      'wallet-has-badge',
      tupleCV({
        user: standardPrincipalCV(user),
        'badge-name': stringAsciiCV(badgeId.trim()),
      }),
    );

    return toBoolean(value, false);
  }

  async checkBadgeEligibility({ user, badgeId }) {
    const address = assertStacksAddress(user);
    const badge = BADGE_CATALOG.find((item) => item.id === badgeId);

    if (!badge) {
      throw new RangeError(`Unknown badge id: ${badgeId}`);
    }

    const [profile, owned] = await Promise.all([
      this.getUserProfile(address),
      this.hasBadge(address, badge.id),
    ]);

    const requirements = {
      minXP: badge.minXP,
      minLevel: badge.minLevel,
      xpMet: profile.xp >= badge.minXP,
      levelMet: profile.level >= badge.minLevel,
    };

    return {
      user: address,
      badgeId: badge.id,
      owned,
      eligible: !owned && requirements.xpMet && requirements.levelMet,
      profile,
      requirements,
    };
  }

  async getUserStats(address) {
    const user = assertStacksAddress(address);
    const [profile, score, rankTier] = await Promise.all([
      this.getUserProfile(user),
      this.getLeaderboardScore(user),
      this.getRankTier(user),
    ]);

    return {
      address: user,
      xp: profile.xp,
      level: profile.level,
      score,
      rankTier,
    };
  }

  connectWallet() {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Wallet connection is only available in a browser'));
    }

    const userSession = this.userSession ?? new UserSession({
      appConfig: new AppConfig(['store_write', 'publish_data']),
    });

    this.userSession = userSession;

    return new Promise((resolve) => {
      showConnect({
        userSession,
        appDetails: {
          ...this.appDetails,
          icon: this.appDetails.icon.startsWith('http')
            ? this.appDetails.icon
            : `${window.location.origin}${this.appDetails.icon}`,
        },
        onFinish: () => resolve(userSession.loadUserData()),
        onCancel: () => resolve(null),
      });
    });
  }
}
