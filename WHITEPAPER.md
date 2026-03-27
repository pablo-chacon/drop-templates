
---

# DROP Protocol

### Trustless, Universal Storage Settlement (Mainnet-Ready)

## Abstract

DROP Protocol is a minimal, production-ready settlement layer for decentralized storage networks. It provides escrow, fee routing, and deterministic finalization for storage sessions on public blockchains. Any marketplace, app, or logistics platform can integrate DROP to get neutral, trust-minimized storage settlement without giving up their own matching logic, UX, or business model.

DROP is **not** a storage service and does not operate lockers, warehouses, containers, or storage spaces. It is open-source general-purpose software: a protocol others can use, fork, or ignore under their own legal responsibilities.

---

## 1. Introduction

Traditional storage systems are often centralized, opaque, and inaccessible to independent operators. At the same time, there is enormous unused storage capacity distributed across the physical world: spare rooms, sheds, lockers, shipping containers, and commercial spaces that sit underutilized.

DROP Protocol addresses this gap by focusing **exclusively on the settlement rail**:

* Who should get paid?
* Under what conditions?
* How can trust between dropper, storage operator, and picker be minimized?

All matching, user interfaces, and product logic live off-chain. The protocol itself encodes only a small, auditable state machine for storage sessions, escrow, and fees.

---

## 2. Design Goals

DROP is designed to be:

* **Minimal**: One small, composable settlement layer; no monolithic "all-in-one" stack.
* **Neutral**: DROP is not a marketplace, front-end, or operator; it is just code.
* **DeFi/CeFi Agnostic**: Only convert value to an ERC-20 token.
* **Permissionless**: Anyone can create sessions, operate a space, or build apps on top.
* **Composable**: Works independently or as part of a larger logistics mesh (e.g. combined with DeDe Protocol for fractionalized P2P supply chains).
* **Predictable**: Protocol fee is immutable; platform fees are explicit and off-chain.
* **Legible**: Session lifecycle and events are deterministic, so indexers and explorers can reason about them.

Any **off-chain** workflows, matching strategies, or UX flows described in this document are illustrative only and are **not** required, enforced, or validated by DROP Protocol.

---

## 3. System Overview

The canonical DROP Protocol deployment consists of three contracts:

1. **DROPCore**: ERC-721 storage session lifecycle, escrow coordination, and finalization logic.
2. **DROPSpaceRegistry**: Declarative on-chain registry of storage spaces and capacity.
3. **Escrow**: Token and ETH escrow, fee splits, and payouts.

The protocol is implemented with Solidity 0.8.24 and Foundry tooling.

### 3.1 Canonical Deployment

DROP Protocol is deployed on Ethereum mainnet.

DROPCore (ERC-721):
TBD — address published after mainnet deploy.

**The deployment is immutable and permissionless. No upgrades or governance actions are possible.**

---

## 4. Core Components

### 4.1 DROPCore: Session State Machine

`DROPCore` is the main settlement engine. Each storage session is an ERC-721 token that encodes the session lifecycle on-chain:

* **Created**: A dropper creates a session and funds escrow. Space capacity is not yet reserved.
* **Dropped**: Operator attests the item has been received into storage. Capacity is reserved.
* **Picked**: Operator attests the item has left storage. Capacity is released. 48h window starts.
* **Finalized**: Escrow is released to the operator. Session is closed.

Each session stores:

* Parties: `dropper`, `picker` (informational)
* Space: `spaceId`
* Timestamps: `createdAt`, `droppedAt`, `pickedAt`, `finalizeAfter`
* Evidence anchors: `dropEvidenceHash`, `pickEvidenceHash`, `dropEvidenceCid`, `pickEvidenceCid`
* Economics: `escrowToken`, `escrowAmount`, `escrowed`
* Off-chain reference: `settlementRefHash`

The protocol enforces **automatic finalization**:

* `finalizeAfter` is set to `pickedAt + 48 hours`.
* Anyone can call `finalize(storageId)` after that time.
* The finalizer receives a small **tip** (default 0.05% of escrow).

This removes the need for a centralized keeper or cron server.

### 4.2 Settlement Triggers

Escrow releases to the storage operator under two conditions:

* **Picker calls `confirmPickup(storageId)`** — explicit Proof-of-Custody. Settles immediately.
* **48 hours elapse after `pick()`** — permissionless timeout. Anyone may finalize and receive the tip.

Dropper and picker may be the same address. The protocol is neutral.

### 4.3 DROPSpaceRegistry: Space Registry

`DROPSpaceRegistry` is a declarative on-chain registry:

* Operators register spaces with capacity, availability window, coarse location hash, and a hash commitment to off-chain terms.
* Capacity reservation and release are gated exclusively to `DROPCore`.
* No pricing, ranking, matching, or identity on-chain.

### 4.4 Escrow: Token & ETH Settlement

`Escrow` is a simple ledger keyed by `storageId`:

* `fund(id, token, amount, payer)`: called by `DROPCore` when a session is created.
* `releaseWithFees(...)`: splits escrowed funds between:
  * **Operator**: main payout
  * **Protocol treasury**: immutable 0.3% protocol fee
  * **Finalizer**: caller tip (0.05%)
* `refund(id, to)`: returns the full escrow amount (unused in base protocol, no disputes).

`Escrow` trusts **only** `DROPCore` as a caller. No external app can arbitrarily access funds.

---

## 5. Session Lifecycle

### 5.1 Creation

* A dropper calls `createStorage(storageId, spaceId, picker, escrowToken, escrowAmount, settlementRefHash)`.
* `Escrow.fund` is invoked and holds the funds.
* A DROP NFT is minted to the dropper.
* Session state: **Created**.

### 5.2 Drop

* The registered space operator calls `drop(storageId, evidenceHash, evidenceCid)`.
* Protocol records `droppedAt` and reserves 1 capacity unit in the registry.
* Session state: **Dropped**.

### 5.3 Pick

* The registered space operator calls `pick(storageId, evidenceHash, evidenceCid)`.
* Protocol records `pickedAt`, sets `finalizeAfter = pickedAt + 48 hours`, and releases capacity.
* Session state: **Picked**.

### 5.4 Confirmation (primary path)

* Picker calls `confirmPickup(storageId)` — Proof-of-Custody.
* Escrow settles immediately to the operator.
* Session state: **Finalized**.

### 5.5 Timeout Finalization (liveness fallback)

* After `finalizeAfter`, anyone calls `finalize(storageId)`.
* Escrow settles to the operator; caller receives the tip.
* Session state: **Finalized**.

### 5.6 No Escrow Path

* If `escrowAmount == 0`, settlement is off-chain.
* `finalize()` or `confirmPickup()` records state only.

---

## 6. Fees and Economics

### 6.1 Protocol Fee (Immutable)

* **0.3% (30 basis points)**.
* Paid on every successful escrow release to the **protocol treasury**.
* Hard-coded as `immutable` in `DROPCore`. Cannot be changed after deployment.

### 6.2 Platform Fee

* No platform fee at the protocol level.
* Platform economics are entirely off-chain.
* Platforms interact with DROP and apply their own pricing externally.

### 6.3 Finalizer Tip

* `finalizeTipBps` default: 5 (0.05%).
* Paid to whoever calls `finalize()` after the 48h timeout.
* Frozen permanently at deploy, ownership is renounced.

### 6.4 Composability with DeDe Protocol

DROP is designed to be sovereign, composable with DeDe Protocol (P2P delivery settlement):

```
DeDe carrier -> DROP storage operator -> DeDe carrier -> destination
```

Each hop settles independently. No protocol knows about the others.
Protocol fees stack per hop: each DeDe leg settles at 0.5%, each DROP leg at 0.3%.
This fractionalized model enables trustless P2P supply chains without any central coordinator.

---

## 7. Security Model

* **No upgradeability**: contracts are final.
* **Immutable protocol fee**: cannot be changed post-deploy.
* **Set-once core pointer**: registry and escrow core addresses are permanently locked.
* **Ownership renounced**: no admin surface after deploy.
* **Escrow isolation**: only `DROPCore` can instruct `Escrow` to pay or refund.
* **Permissionless finalize**: no reliance on any single keeper or cron job.
* **ReentrancyGuard**: escrow fund/release/refund are nonreentrant.

---

## 8. What DROP Is and Is Not

### 8.1 DROP *Is*

* A **settlement rail** for storage sessions.
* A **smart-contract escrow** with deterministic states and fees.
* A **declarative space registry** for on-chain capacity tracking.
* An **open-source, neutral protocol** anyone can integrate with.

### 8.2 DROP Is *Not*

* A storage company or operator.
* A space marketplace or booking platform.
* A routing or matching engine.
* A KYC/AML system.
* A dispute arbitrator.

All of those concerns must be handled by the applications and organizations that build on top of DROP.

---

## 9. Legal Position and Responsibility Boundary

DROP runs entirely on public blockchains. Its developers:

* Do not operate storage spaces, lockers, warehouses, or containers.
* Do not contract with droppers, operators, or pickers.
* Do not control or intermediate actual storage operations.
* Publish open-source code that anyone can deploy and use independently.

Responsibility for lawful use rests with:

* The entities who deploy the contracts.
* The apps and marketplaces that integrate them.
* The operators and platforms that perform real-world storage operations.
* The platform and/or operator, who is responsible for reporting income according to local taxation and law.

---

## 10. Integration Patterns and Use Cases

* **P2P Luggage Storage**: Individuals offer spare space during travel. App handles matching, DROP handles settlement.
* **Micro-Logistics Hubs**: Shipping containers or lockers act as intermediate storage in multi-hop delivery chains combining DeDe and DROP.
* **Last-Mile Storage**: Local businesses offer pickup storage. DROP settles between dropper and operator without a centralized platform.
* **Supply Chain Custody**: Industrial storage handoffs are anchored on-chain with evidence hashes. Settlement is deterministic.
* **Disaster Relief Logistics**: Decentralized storage coordination in low-trust environments where central operators are unavailable.

These **examples are illustrative** only and do not imply any endorsement, recommendation, or required implementation pattern.

---

## 11. Conclusion

DROP Protocol is a canonical, minimal implementation of a **trustless storage settlement rail**. It:

* Uses ERC-721 sessions as a clear, auditable representation of storage custody.
* Handles escrow, fees, and finalization in a deterministic way.
* Keeps a hard-coded, immutable protocol fee for the DROP treasury.
* Keeps platform economics entirely off-chain.
* Composes naturally with DeDe Protocol for fractionalized supply chain settlement.

It is not a product or company; it is **neutral infrastructure**. Anyone can audit, fork, or deploy it.

---

**[Contact Email](pablo-chacon-ai@proton.me)**
