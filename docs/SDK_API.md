# SDK API Reference

## Client methods

| Method | Purpose |
|---|---|
| `getUserProfile(address)` | Read XP and level |
| `getUserStats(address)` | Combine profile, score, and rank tier |
| `getLeaderboardScore(address)` | Read leaderboard score |
| `getRankTier(address)` | Read rank tier |
| `getTokenBalance(address, token)` | Read `one` or `poin` base units |
| `isTaskDone(address, taskId)` | Read mission completion |
| `hasBadge(address, badgeId)` | Read badge ownership |
| `checkBadgeEligibility(input)` | Evaluate ownership and profile thresholds |
| `connectWallet()` | Open browser wallet connection |
| `callReadOnly(...)` | Call a configured read-only function |
| `readMapEntry(...)` | Read and decode a contract map entry |

## Registries

`STACKSONE_MAINNET` contains the canonical deployer and contract names. `MISSION_CATALOG` and `BADGE_CATALOG` contain metadata shared by the SDK and frontend.

Configured badge identifiers are `genesis`, `node`, and `guardian`.

## Helpers

- `calculateLevel(xp)`
- `getRankTier(score)`
- `getMission(taskId)`
- `getTaskReward(taskId)`
- `getContractId(name, deployer?)`
- `getExplorerContractUrl(name, deployer?)`
- `resolveStacksNetwork(value)`
- `assertStacksAddress(address)`
- `toSafeNumber(value, fallback?)`
- `toBoolean(value, fallback?)`

Invalid addresses and token names throw `TypeError`. Unknown badge identifiers throw `RangeError`. Missing map entries return `null`.

## Test injection

`StacksOneClient` accepts custom `network`, `readOnly`, `fetcher`, `decode`, and `decodeHex` options. This allows deterministic tests without live network calls. See `tests/client.test.js`.
