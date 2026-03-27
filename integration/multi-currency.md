
---

# **Multi-Currency Integrations (BTC, XMR, Fiat, Solana, TON, etc.)**

DROP Protocol is an **EVM-native settlement layer**.
It handles value transfer exclusively using **ERC-20 tokens** inside a trust-minimized, on-chain escrow.

However, any app or marketplace can still accept **any currency**:

* Bitcoin (BTC)
* Monero (XMR)
* Fiat (EUR, USD, SEK)
* Lightning payments
* Solana / TON / Tron
* Layer-2 native tokens
* Any privacy coin

The key is simple:

> **Convert incoming payments into an ERC-20 token before interacting with DROP.**

This keeps DROP universal, minimal, and secure without expanding protocol complexity.

---

## **Why DROP Uses ERC-20 Internally**

DROP is designed to be:

* **immutable**
* **auditable**
* **minimal**
* **EVM-native**
* **platform-agnostic**

Supporting native BTC, XMR, or other L1s on-chain would introduce:

* bridging risks
* custodial wrappers
* cross-chain messaging
* additional trust assumptions
* increased attack surface

By keeping DROP strictly ERC-20 inside the escrow, integrations remain:

* simple
* secure
* predictable
* composable

---

## **Architecture Overview**

Here is how a multi-currency integration typically looks:

```
User Pays (BTC / XMR / Solana / Fiat / etc.)
                │
                ▼
       Marketplace/App Backend
     (performs conversion to ERC-20)
                │
                ▼
        DROP Protocol (EVM)
      - Escrow (ERC-20 only)
      - DROPCore
      - DROPSpaceRegistry
                │
                ▼
         Session is finalized
                │
                ▼
   Marketplace optionally swaps back
 (ERC-20 → BTC/XMR/Fiat or keeps as-is)
```

This model is identical to how Web2 apps abstract payments today:

* PayPal
* Uber
* Airbnb
* Shopify
* Storage platforms

They accept many currencies, but the backend uses a single internal settlement currency.

---

## **Practical Integration Example (BTC)**

### 1. Dropper pays in BTC

Using on-chain BTC or Lightning.

### 2. Your app converts BTC → ERC-20

Options include:

* an internal hot wallet
* a payment service provider
* a liquidity partner
* a decentralized swap (if the user already provided wrapped assets)

### 3. Your app calls DROP

```solidity
token.approve(escrow, amount);
dropCore.createStorage(storageId, spaceId, picker, token, amount, settlementRefHash);
```

### 4. DROP handles escrow and settlement

The value stays secure until session completion.

### 5. Your app receives ERC-20 payout

Optionally convert back:

* ERC-20 → BTC
* ERC-20 → fiat
* or keep in stables/ETH

---

## **Practical Integration Example (Monero)**

Monero is fully off-chain relative to EVMs.

Flow:

1. User pays XMR
2. Backend swaps XMR → USDC (or any ERC-20)
3. Interact with DROP
4. Receive payout in USDC
5. Swap USDC → XMR (optional)
6. Distribute to operators/users

This supports privacy-sensitive regions while keeping DROP clean and deterministic.

---

## **Recommended ERC-20 Tokens for Integration**

Most platforms choose:

* **USDC** → predictable, stable
* **USDT** → globally available
* **DAI** → decentralized stablecoin
* **WETH** → gas-aligned
* **Platform-native tokens** → if the app has its own token economy

DROP does not enforce a specific token.

---

## **Example Backend Pseudocode**

```python
# dropper pays in BTC
btc_received = receive_btc_payment()

# convert to ERC-20 (via exchange or service)
erc20_amount = swap_btc_to_erc20(btc_received)

# interact with DROP
approve(token, ESCROW_ADDRESS, erc20_amount)
storage_id = drop_core.createStorage(
    storageId=generate_id(),
    spaceId=chosen_space_id,
    picker=picker_address,
    escrowToken=token,
    escrowAmount=erc20_amount,
    settlementRefHash=bytes32(0)
)

# wait for operator attestation + pickup confirmation
await_session_finalization(storage_id)

# optionally convert payout back to BTC/XMR/etc.
payout = get_erc20_payout(storage_id)
swap_to_btc_or_xmr(payout)
```

This backend template works with any payment source.

---

## **What DROP Will Never Do (By Design)**

To preserve security and immutability, DROP does **not**:

* Accept native BTC
* Accept native XMR
* Connect to non-EVM chains
* Perform bridging
* Custody wrapped assets
* Offer swap/FX logic

All of these remain **off-chain responsibilities** of the integrating platform.

---

## **Security Notes**

* Conversion must happen **before** DROP escrow.
* Your backend should protect private keys and hot wallets.
* Keep ERC-20 tokens isolated from operational funds (recommended).
* Use your own risk policies for FX and slippage.

DROP stays trustless; you handle the fiat/crypto UX.

---

## **Summary**

**DROP Protocol is currency-agnostic.**
Any marketplace or app can build on top of it, regardless of what the end-users pay with.

They simply:

1. Accept payment in any currency
2. Convert value → ERC-20
3. Interact with DROP as usual
4. Optionally convert payouts afterward

This model gives the ecosystem maximum flexibility while keeping DROP protocol minimal, secure, and future-proof.

---
