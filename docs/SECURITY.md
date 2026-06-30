# Security Policy

## Supported line

The actively maintained package line is `2.x`.

## Reporting

Report suspected security issues privately to the repository maintainer. Include the affected component, reproducible steps, observed behavior, expected behavior, and impact. Do not disclose an unresolved issue in a public discussion.

## Boundaries

- Clarity contracts enforce authorization and ownership.
- Frontend validation is a user-experience control.
- Wallet submission is not final confirmation.
- On-chain records remain authoritative.
- Supabase is optional and must not override chain state.
- Contract identifiers are centralized in `sdk/contracts.js`.

## Current limitations

- No independent third-party audit has been completed.
- Administrative operation needs a documented multisig process.
- No protocol-wide pause mechanism is available.
- Deployed contracts require a new version for logic changes.
- The v10 mission interface keeps caller-supplied reward arguments for compatibility; a future version should resolve rewards from contract-controlled state.

Changes to authorization, rewards, contract identifiers, or asset presentation require tests and CI validation.
