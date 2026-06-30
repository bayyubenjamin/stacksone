# System Architecture

```text
React application
      ↓
StacksOne SDK and registry
      ↓
Stacks API reads + wallet submissions
      ↓
Clarity contracts
```

Supabase is optional. Confirmed on-chain records remain authoritative.

The protocol is separated into core progression, missions, badges, tokens, leaderboard, reputation, boost, and engagement modules.

The deployer and application contract names are centralized in `sdk/contracts.js`. UI components import the registry rather than repeating identifiers.

Wallet request, transaction submission, and confirmed chain state are separate stages. Writes remain pending until a later read exposes the expected result.
