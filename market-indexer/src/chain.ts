import { createPublicClient, webSocket, parseAbiItem } from "viem";

const abiSessionCreated = parseAbiItem(
  "event SessionCreated(uint256 indexed storageId, uint256 indexed spaceId, address indexed dropper, address picker)"
);
const abiDropped = parseAbiItem(
  "event Dropped(uint256 indexed storageId, uint64 t, bytes32 evidenceHash, string evidenceCid)"
);
const abiFinalized = parseAbiItem(
  "event Finalized(uint256 indexed storageId, address operator, bool byTimeout)"
);

export function startChainListener({
  onSessionCreated,
  onDropped,
  onFinalized,
}: {
  onSessionCreated: (e: {
    storageId: bigint;
    spaceId: bigint;
    dropper: `0x${string}`;
    picker: `0x${string}`;
  }) => void;
  onDropped: (e: { storageId: bigint }) => void;
  onFinalized: (e: { storageId: bigint }) => void;
}) {
  const client = createPublicClient({
    transport: webSocket(process.env.RPC_URL as string),
    chain: {
      id: Number(process.env.CHAIN_ID || 1),
      name: "drop",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: { http: [], webSocket: [process.env.RPC_URL!] },
      },
    },
  });

  const address = process.env.DROP_CORE as `0x${string}`;

  client.watchEvent({ address, event: abiSessionCreated }, (log) => {
    const [storageId, spaceId, dropper, picker] = log.args as any;
    onSessionCreated({ storageId, spaceId, dropper, picker });
  });

  client.watchEvent({ address, event: abiDropped }, (log) => {
    const [storageId] = log.args as any;
    onDropped({ storageId });
  });

  client.watchEvent({ address, event: abiFinalized }, (log) => {
    const [storageId] = log.args as any;
    onFinalized({ storageId });
  });
}
