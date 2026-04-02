
---

# **DROP Templates (Starter Kit for DROP Protocol Integrations)**


## Legal Disclaimer

This repository contains general-purpose developer templates, examples, infrastructure files, and indexing tools intended to help builders integrate with the DROP Protocol.

The authors and contributors:

**do not** operate any storage service, locker network, warehouse, or marketplace built using this template

**do not** verify, supervise, or monitor users, operators, platforms, or any third-party systems

**do not** provide legal, financial, tax, compliance, or regulatory advice

**are not responsible for deployments**, integrations, business decisions, or real-world usage of any application built using this repository

**do not** guarantee correctness, uptime, safety, or suitability for any purpose

All usage of this repository, including running the included infrastructure, deploying the protocol, or integrating DROP into any service, is performed entirely at the risk of the user.

This **software is offered strictly as-is**, without any warranties, express or implied.
The **authors are not liable** for any damages, losses, claims, or other issues arising from the use, misuse, failure, or operation of this software or any derivative work.

By cloning, modifying, deploying, or interacting with this repository in any capacity, you agree that you alone are responsible for ensuring legal compliance, operational safety, and all outcomes of your integration.

**[DROP Protocol Whitepaper](https://github.com/pablo-chacon/drop-protocol/blob/main/WHITEPAPER.md)**

---

## Minimal, quick starter kit for building apps on top of DROP Protocol.

This repository provides:

* **Local dev environment** (Anvil + Postgres)
* **Market Indexer** that listens to `DROPCore` events
* **"Storage available near me" API** (`/sessions`)
* **Examples** for deploying the protocol + using the indexer
* **Config system** for storing deployed contract addresses

This repo intentionally **does not** contain Solidity code.
All smart contracts live in the canonical on-chain repo:

**[DROP Protocol Repository](https://github.com/pablo-chacon/drop-protocol)**

---

## Ethereum Mainnet Deployment

**Canonical DROP Protocol contract addresses (Ethereum mainnet)**:

* DROPCore:          0x924cC808389F0385dBe3F0248796147D85635338
* DROPSpaceRegistry: 0xfbf7Ed40f0FA992D2Ddc07250FE2D0e72Cbd12c9
* Escrow:            0x9e859D91C900F799F23F55FffCdAf389118a5766
* protocolTreasury:  0xcd89321D5a9080e417ac01c8F46F643548ad7C04

**The deployment is immutable and permissionless. No upgrades or governance actions are possible.**

---

## Suggested Platform Fee

DROP Protocol **auto-finalizes a session 48 hours after pick()** unless the picker has already called `confirmPickup()`.
This keeps DROP Protocol **trustless** and ensures operators are settled without requiring a centralized keeper.

DROP supports arbitrarily small escrow amounts at the protocol level.
However, integrators are **expected** to **enforce** minimum session values appropriate to **gas costs** and **token precision**.

Platform fees are entirely off-chain concerns.
The DROP Protocol author has no responsibility for, or control over, **platform fees** or other **policies**.

---

## Additional suggestions

It is **encouraged** to have an **operator rating**, **storage type filtering**, and **capacity availability** data.
**Platforms** decide if or how to implement this functionality.

The DROP Protocol author has no responsibility for, or control over, **anti-scam measures, platform fees**, or other **policies**.

---

## Multi-Currency Integration (DeFi/CeFi)


**[DROP Multi-Currency DeFi Integration](https://github.com/pablo-chacon/drop-templates/blob/main/integration/multi-currency.md)**


**[DROP Multi-Currency CeFi Integration](https://github.com/pablo-chacon/drop-templates/blob/main/integration/multi-currency-cefi.md)**

---

## Micro-logistics


Decentralized Micro-logistics concept:


[Micro-logistics](https://github.com/pablo-chacon/drop-protocol/blob/main/docs/micro-logistics.md)

---

## Repository Structure

```
drop-templates/
.
├── config
│   └── deployments.local.json
├── examples
│   └── deploy-local.sh
├── infra
│   ├── docker-compose.yml
│   └── sql
│       └── init.sql
├── integration
│   ├── multi-currency.md
│   └── multi-currency-cefi.md
├── market-indexer
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── app.ts
│   │   ├── chain.ts
│   │   ├── db.ts
│   │   └── routes.ts
│   └── tsconfig.json
├── FAQ.md
├── README.md
└── WHITEPAPER.md
```

---

## 1. Deploying DROP Protocol Locally (Anvil)

### Prerequisites

* Node.js ≥ 18
* Docker & Docker Compose
* Foundry (for local contract deployment)
* Git


This repo expects that you deploy the on-chain DROP Protocol locally and store the resulting contract addresses inside `config/deployments.local.json`.

You can use the **included helper script**:

```bash
cd examples
chmod +x deploy-local.sh
./deploy-local.sh
```

This will:

1. Start anvil (if not running)
2. Deploy the protocol using `DeployProtocol.s.sol` from the canonical repo
3. Write addresses into:

   ```
   config/deployments.local.json
   ```

Example output of that file:

```json
{
  "dropCore": "0x123456...",
  "dropRegistry": "0xabcdef...",
  "escrow": "0xfeedbeef...",
  "chainId": 31337
}
```

### 1.1 Optional: Use Canonical DROP Mainnet Deployment

If you want to **integrate directly** against the canonical DROP Protocol
deployment on Ethereum mainnet, you can skip local deployment and
configure the templates to **point at the canonical on-chain contracts**.

This is purely a convenience option. The templates remain generic and
can be used with any DROP-compatible deployment.

**Canonical Ethereum Mainnet (chainId: 1) Addresses**:

* DROPCore:          0x924cC808389F0385dBe3F0248796147D85635338
* DROPSpaceRegistry: 0xfbf7Ed40f0FA992D2Ddc07250FE2D0e72Cbd12c9
* Escrow:            0x9e859D91C900F799F23F55FffCdAf389118a5766
* protocolTreasury:  0xcd89321D5a9080e417ac01c8F46F643548ad7C04

These contracts are immutable and permissionless.
Using these **addresses does not imply any** affiliation, approval,
or governance relationship with the protocol authors.

When using the mainnet deployment, the **indexer must be configured**
with the canonical contract addresses. One simple approach is to
replace `deployments.local.json` with a manually created config file
containing the official addresses.

---

## **2. Start the Template Stack**

### Run everything:

When using mainnet, ensure deployments.local.json contains the canonical addresses or adjust your configuration source accordingly.

```bash
cd infra
export DROP_CORE=$(jq -r '.dropCore' ../config/deployments.local.json)
docker compose up --build
```

This launches:

* **anvil** (local chain)
* **postgres** (for session storage)
* **market-indexer** (listens to DROPCore events)

---

## **3. Using the Market Indexer**

Once the stack is running:

### List open storage sessions by region:

```bash
curl "http://localhost:8081/sessions?region=SE-AB"
```

### Health check:

```bash
curl http://localhost:8081/healthz
```

---

## **4. How It Works**

### `market-indexer/src/chain.ts`

* Connects to your local `anvil` node
* Watches `SessionCreated` → adds session to DB
* Watches `Dropped` → updates session state in DB
* Watches `Finalized` → removes session from DB

### `market-indexer/src/db.ts`

Implements:

* `upsertSession()`
* `removeSession()`
* `listSessionsByRegion()`

### `infra/sql/init.sql`

Creates a minimal DB schema:

```
sessions_open
  storage_id
  dropper
  reward_amount
  reward_token
  space_geohash5
  region
  storage_type
  created_at
```

### `routes.ts`

Exposes the `/sessions` API endpoint.

---

## **5. Customizing the Template**

You can modify:

* Region derivation
* Geohash extraction
* Storage type filtering
* Capacity availability filters
* Additional operator metadata

This repo is intentionally small and unopinionated so builders can adapt it quickly.

---

## **6. Production Notes**

* Replace hardcoded `"SE-AB"` and `"u6q4y"` with real geospatial logic
* Use a real RPC instead of Anvil
* Secure Postgres credentials
* Add API rate limiting
* Deploy indexer as stateless microservice (Docker/K8s)
* Configure logging + monitoring

---

## **7. Canonical Protocol Repository**

All on-chain code, tests, and deployment scripts live here:

**[https://github.com/pablo-chacon/drop-protocol](https://github.com/pablo-chacon/drop-protocol)**

This template repo is purely for application developers integrating with DROP.

---

## **License**

MIT License

Copyright (c) 2025 Emil Karlsson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**[Contact Email](pablo-chacon-ai@proton.me)**
