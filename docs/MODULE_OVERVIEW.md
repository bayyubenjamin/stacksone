# 🧩 StacksOne Modular Extension Layer

This document outlines lightweight modular contracts deployed as ecosystem extensions.

## Lightweight Modules (v1)

### genesis-counter-v1
Simple state increment module.
- increment()
- get-count(principal)

### genesis-flag-v1
Boolean toggle module.
- toggle()
- get-flag(principal)

### genesis-points-v1
Minimal scoring layer.
- add(uint)
- get-points(principal)

### genesis-badge-lite-v1
Lightweight badge claim module.
- claim()
- has-badge(principal)

### genesis-score-lite-v1
Secondary scoring sandbox.
- add-score(uint)
- get-score(principal)

---

Design Goals:
- Gas efficiency
- Modular experimentation
- Isolated state logic
- Non-destructive ecosystem growth
