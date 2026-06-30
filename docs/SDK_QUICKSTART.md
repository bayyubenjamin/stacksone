# SDK Quick Start

Install the ES module package:

```bash
npm install @bayybays/stacksone-sdk
```

Create a mainnet client:

```js
import { StacksOneClient } from '@bayybays/stacksone-sdk';

const client = new StacksOneClient({
  network: 'mainnet',
  appDetails: {
    name: 'My Stacks App',
    icon: 'https://example.com/icon.png',
  },
});
```

Read a complete profile and leaderboard summary:

```js
const stats = await client.getUserStats(address);
```

Read configured token balances in base units:

```js
const one = await client.getTokenBalance(address, 'one');
const poin = await client.getTokenBalance(address, 'poin');
```

Read mission and badge state:

```js
const completed = await client.isTaskDone(address, 101);
const owned = await client.hasBadge(address, 'node');
const eligibility = await client.checkBadgeEligibility({
  user: address,
  badgeId: 'node',
});
```

Connect a browser wallet:

```js
const userData = await client.connectWallet();
```

Package subpaths are available for focused imports:

```js
import { STACKSONE_MAINNET } from '@bayybays/stacksone-sdk/contracts';
import { resolveStacksNetwork } from '@bayybays/stacksone-sdk/network';
import { calculateLevel } from '@bayybays/stacksone-sdk/utils';
```

A wallet callback means the transaction was submitted, not confirmed. Mark writes as pending and read the chain again before presenting final state.

See [SDK API Reference](SDK_API.md) for the complete public surface.
