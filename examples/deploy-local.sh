#!/usr/bin/env bash

set -e

echo "Deploying DROP Protocol to Anvil..."

forge script \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key $LOCAL_PRIVATE_KEY \
  "$HOME/drop-protocol/script/DeployProtocol.s.sol:DeployProtocol"

echo "Done."
