import Fastify from "fastify";
import routes from "./routes";
import { upsertSession, removeSession } from "./db";
import { startChainListener } from "./chain";

// NOTE FOR BUILDERS:
// Replace hardcoded geohash5 + region with real geospatial logic
// derived from the operator's registered coarseLocationHash or off-chain metadata.

const app = Fastify({ logger: true });
app.register(routes);

startChainListener({
  onSessionCreated: async ({ storageId, dropper }) => {
    // For MVP, publish coarse placeholder region.
    // In production: resolve geohash + region from operator metadata.
    await upsertSession({
      storageId,
      dropper,
      amount: "0",       // escrow amount not available from SessionCreated — enrich via RPC if needed
      token: "0x0000000000000000000000000000000000000000",
      geohash5: "u6q4y",
      region: "SE-AB",
      storageType: "locker",
    });
    app.log.info(`SessionCreated ${storageId.toString()}`);
  },

  onDropped: async ({ storageId }) => {
    // Item is now in storage — no DB change needed for basic availability index,
    // but platforms may want to mark session as active here.
    app.log.info(`Dropped ${storageId.toString()}`);
  },

  onFinalized: async ({ storageId }) => {
    await removeSession(storageId);
    app.log.info(`Finalized ${storageId.toString()}`);
  },
});

app.get("/healthz", async () => ({ ok: true }));

app.listen({ host: "0.0.0.0", port: Number(process.env.PORT || 8081) });
