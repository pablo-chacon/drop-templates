import { Pool } from "pg";

export const pool = new Pool({ connectionString: process.env.PG_URL });


export async function upsertSession(p: {
  storageId: bigint;
  dropper: string;
  amount: string;
  token: string;
  geohash5: string;
  region: string;
  storageType?: string;
}) {
  await pool.query(
    `INSERT INTO sessions_open(
       storage_id, dropper, reward_amount, reward_token,
       space_geohash5, region, storage_type
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (storage_id) DO UPDATE SET
       dropper        = EXCLUDED.dropper,
       reward_amount  = EXCLUDED.reward_amount,
       reward_token   = EXCLUDED.reward_token,
       space_geohash5 = EXCLUDED.space_geohash5,
       region         = EXCLUDED.region,
       storage_type   = EXCLUDED.storage_type`,
    [
      p.storageId.toString(),
      p.dropper,
      p.amount,
      p.token,
      p.geohash5,
      p.region,
      p.storageType ?? null,
    ]
  );
}


export async function removeSession(storageId: bigint) {
  await pool.query(
    `DELETE FROM sessions_open WHERE storage_id = $1`,
    [storageId.toString()]
  );
}


export async function listSessionsByRegion(region: string, limit = 50) {
  const res = await pool.query(
    `SELECT
       storage_id, dropper, reward_amount, reward_token,
       space_geohash5, region, storage_type,
       extract(epoch from created_at)::bigint AS created_at
     FROM sessions_open
     WHERE region = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [region, limit]
  );
  return res.rows;
}
