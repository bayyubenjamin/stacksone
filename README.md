# StacksOne

[![CI](https://github.com/bayyubenjamin/stacksone/actions/workflows/clarinet.yaml/badge.svg)](https://github.com/bayyubenjamin/stacksone/actions/workflows/clarinet.yaml) [![npm](https://img.shields.io/npm/v/@bayybays/stacksone-sdk)](https://www.npmjs.com/package/@bayybays/stacksone-sdk) ![Stacks](https://img.shields.io/badge/network-Stacks-5546FF?logo=stacks) ![License](https://img.shields.io/badge/license-MIT-2ea44f)

StacksOne is a modular identity, progression, mission, badge, token, leaderboard, and engagement layer built on Stacks. The repository contains a React reference application, the `@bayybays/stacksone-sdk` package, wallet integration, and a Clarinet smart-contract workspace.

## Product flow

```text
Connect wallet → read profile → complete mission → submit transaction
→ wait for confirmation → earn XP → unlock badges → build reputation
```

Wallet request, transaction submission, and confirmed chain state are treated as separate stages. The UI keeps writes pending until the expected state can be read on-chain.

## Repository

| Path | Purpose |
|---|---|
| `src/` | Home, Tasks, Vault, Profile, and Gaming UI |
| `sdk/` | Client, contract registry, network, and value helpers |
| `smart-contracts/` | Clarity sources, Clarinet manifest, and Simnet tests |
| `tests/` | Public SDK behavior tests |
| `docs/` | SDK, architecture, workflow, contract, and security notes |

## Quick start

```bash
git clone https://github.com/bayyubenjamin/stacksone.git
cd stacksone
npm ci
cp .env.example .env
npm run dev
```

Supabase values are optional. Run quality checks with:

```bash
npm test
npm run build
npm pack --dry-run
cd smart-contracts && npm ci && npm test
```

## SDK

```js
import { StacksOneClient } from '@bayybays/stacksone-sdk';

const client = new StacksOneClient({ network: 'mainnet' });
const stats = await client.getUserStats(address);
const balance = await client.getTokenBalance(address, 'one');
const taskDone = await client.isTaskDone(address, 101);
```

Read [SDK Quick Start](docs/SDK_QUICKSTART.md) and [SDK API Reference](docs/SDK_API.md).

## Configured mainnet contracts

Deployer: `SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3`

`genesis-core-v10` · `genesis-missions-v10` · `genesis-badges-v10` · `genesis-leaderboard-v1` · `genesis-boost-v1` · `chaintap` · `token-poin` · `token-one`

Application code imports these identifiers from `sdk/contracts.js` to prevent configuration drift.

## Engineering principles

- On-chain records remain authoritative.
- Frontend checks do not replace contract authorization.
- Submitted transactions remain pending until confirmed state is readable.
- Supabase is optional and used only as a supporting layer.
- Contract changes require explicit versioning and migration.

See [Development Workflow](docs/WORKFLOW.md), [Architecture](docs/ARCHITECTURE.md), and [Security Policy](docs/SECURITY.md).

## Roadmap

TypeScript declarations, React hooks, richer confirmation feedback, dedicated activity views, contract-controlled mission rewards, multisig operations, migration playbooks, and expanded integration examples.

## License

Maintained by [Bayu Benjamin](https://github.com/bayyubenjamin) and licensed under the [MIT License](LICENSE).
