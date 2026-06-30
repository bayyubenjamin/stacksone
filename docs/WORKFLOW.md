# Development Workflow

## Root project

```bash
npm ci
npm run dev
npm test
npm run build
npm pack --dry-run
```

The root tests cover the public SDK. The build validates the React application, and the package dry-run verifies the files prepared for npm publication.

## Smart contracts

```bash
cd smart-contracts
npm ci
npm test
```

Contract tests use the Clarinet SDK, Vitest, and Simnet.

## Recommended change order

1. update contract behavior and Simnet tests;
2. update shared SDK registries or helpers;
3. add SDK behavior tests;
4. update the reference frontend;
5. run root and contract checks;
6. review CI and package contents;
7. release through an explicit deployment or package version.

## Repository rules

- Import contract names from `sdk/contracts.js`.
- Avoid duplicated deployer addresses in UI code.
- Keep submitted writes pending until chain reads confirm state.
- Keep optional cache data secondary to on-chain records.
- Document migrations and compatibility changes.

Copy `.env.example` to `.env` only when optional Supabase configuration is needed.
