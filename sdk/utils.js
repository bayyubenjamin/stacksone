export function toSafeNumber(value, fallback = 0) {
  let current = value;

  for (let depth = 0; depth < 10; depth += 1) {
    if (typeof current === 'number') {
      return Number.isFinite(current) ? current : fallback;
    }

    if (typeof current === 'bigint') {
      const numericValue = Number(current);
      return Number.isSafeInteger(numericValue) ? numericValue : fallback;
    }

    if (typeof current === 'string' && current.trim() !== '') {
      const numericValue = Number(current);
      return Number.isFinite(numericValue) ? numericValue : fallback;
    }

    if (!current || typeof current !== 'object') {
      return fallback;
    }

    if ('value' in current) {
      current = current.value;
      continue;
    }

    if ('data' in current) {
      current = current.data;
      continue;
    }

    return fallback;
  }

  return fallback;
}

export function toBoolean(value, fallback = false) {
  let current = value;

  for (let depth = 0; depth < 10; depth += 1) {
    if (typeof current === 'boolean') {
      return current;
    }

    if (!current || typeof current !== 'object') {
      return fallback;
    }

    if ('value' in current) {
      current = current.value;
      continue;
    }

    if ('data' in current) {
      current = current.data;
      continue;
    }

    return fallback;
  }

  return fallback;
}

export function normalizeProfile(value) {
  const profile = value?.value ?? value ?? {};

  return {
    xp: toSafeNumber(profile.xp, 0),
    level: Math.max(1, toSafeNumber(profile.level, 1)),
  };
}

export function assertStacksAddress(address) {
  if (typeof address !== 'string' || !/^[SM][PT][A-Z0-9]{38,40}$/.test(address)) {
    throw new TypeError('address must be a valid Stacks standard principal');
  }

  return address;
}

export function calculateLevel(xp) {
  const normalizedXp = toSafeNumber(xp, Number.NaN);

  if (!Number.isSafeInteger(normalizedXp) || normalizedXp < 0) {
    throw new TypeError('xp must be a non-negative safe integer');
  }

  return Math.floor(normalizedXp / 500) + 1;
}

export function getRankTier(score) {
  const normalizedScore = toSafeNumber(score, Number.NaN);

  if (!Number.isSafeInteger(normalizedScore) || normalizedScore < 0) {
    throw new TypeError('score must be a non-negative safe integer');
  }

  if (normalizedScore >= 1000) return 3;
  if (normalizedScore >= 500) return 2;
  if (normalizedScore >= 100) return 1;
  return 0;
}
