
---

# **DROP Templates: FAQ**

This FAQ answers common questions about using the DROP Templates when building applications, backends, or integrations on top of the DROP Protocol.

For protocol-level questions, see the FAQ in the `drop-protocol` repository.

---

## **What are the DROP Templates for?**

The templates provide minimal, production-oriented examples of how to:

* interact with DROP smart contracts
* create storage sessions
* deposit and release escrow
* listen to session lifecycle events
* process state machine transitions
* integrate ERC-20 tokens
* build backend workflows around DROP's state machine

They are designed to be small, readable, and easy to extend.

---

## **Do I need to use the template exactly as-is?**

No.
They are **starting points**, not frameworks.

You can:

* copy only the parts you need
* mix templates with your existing backend
* replace fetch libraries or RPC providers
* integrate your own identity, matching, or routing layer

DROP is a protocol, not a platform. Templates reflect that philosophy.

---

## **Do the templates include identity or user accounts?**

No.

Identity is **off-chain** and entirely up to the integrator:

* wallet-based auth
* email login
* phone numbers
* Session ID
* no identity at all

Pick whatever fits your use case.
DROP only handles **storage session settlement**.

---

## **Can I use fiat or CeFi payments with these templates?**

Yes.

The templates assume on-chain ERC-20 tokens, but you can integrate:

* Stripe
* PayPal
* bank transfers
* mobile money
* cash-based systems

You convert fiat to ERC-20 before interacting with the DROP contracts.

See `integration/multi-currency-cefi.md`.

---

## **Do the templates include operator matching or space discovery logic?**

No.

Matching, space selection, and availability checking happen **off-chain**.

You may use:

* geohash-based proximity queries
* custom availability heuristics
* a simple "choose any space" interface
* community-based operator listings

The template repos focus only on contract interaction and backend structure.

---

## **What network do the templates use by default?**

Most templates default to:

* **Anvil** for local development
* **Sepolia** for testnet examples
* **Ethereum Mainnet** for production flows

You can change RPC URLs or environment variables easily.

---

## **What ERC-20 token should I use?**

Common choices:

* **USDC** (stable, predictable)
* **USDT** (globally available)
* **DAI** (decentralized stablecoin)
* **WETH** (gas aligned)

The templates do not enforce any specific token.
Use what fits your platform.

---

## **How do I listen for session lifecycle events?**

The indexer includes examples for:

* `SessionCreated`
* `Dropped`
* `Picked`
* `PickupConfirmed`
* `Finalized`

These can be consumed using:

* ethers.js
* viem
* webhooks
* background workers
* indexers (TheGraph, custom scripts)

---

## **Why is the code so minimal?**

DROP is a minimal protocol.
Templates reflect that by being:

* small
* simple
* unopinionated
* easy to audit
* easy to fork

The goal is clarity, not framework-level abstraction.

---

## **Can I build a full storage platform from these templates?**

Yes, but you will need to add:

* your own auth
* your own frontend
* your own database
* your own operator discovery logic
* your own payment flow
* your own capacity and availability UX

The templates are the foundation, not the full stack.

---

## **Are the templates safe for production?**

They are intentionally simple.
Before going to production, you should consider:

* rate limiting
* RPC reliability
* private key management
* secure secret storage
* error handling
* monitoring and logging
* secure event listeners
* robust payout rules
* UX around session state transitions

Use the templates as a base, then harden your systems as needed.

---

## **Where should I ask for help?**

Use **GitHub Discussions** in this repository for:

* integration questions
* debugging
* architectural advice
* template improvements
* show and tell
* multi-currency and CeFi setups

The community can respond there.

---

## **Summary**

DROP Templates help you interact with the protocol quickly and safely:

* minimal boilerplate
* clean examples
* flexible structure
* production-focused patterns
* no assumptions about your business logic

They are designed to let you build your own sovereign storage platform with full control over architecture, trust model, payments, and UX.

---
