# Security Policy

## Supported Versions

The current supported version is:

- v0.1.0

Older versions may not receive security updates.

---

## Reporting a Vulnerability

If you discover a security vulnerability within StacksOne Vault:

- Do NOT open a public issue.
- Contact the maintainer directly via GitHub.
- Provide:
  - Detailed description of the issue
  - Steps to reproduce
  - Expected vs actual behavior
  - Potential impact assessment

All valid security reports will be acknowledged and reviewed.

---

## Security Model Overview

StacksOne Vault implements:

- Dual-Authorization contract architecture
- Restricted minting logic (Core-only access)
- Explicit error-based authorization checks (`err u101`)
- Deterministic testing via Clarinet simnet
- CI-based validation pipeline

---

## Known Limitations

- Admin privileges are currently single-sig.
- No emergency pause mechanism implemented (planned).
- No third-party audit completed yet.

Security improvements are part of the ongoing roadmap.
