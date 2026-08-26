import { Pool, types, type QueryResultRow } from "pg";

// node-postgres returns NUMERIC/DECIMAL as strings to preserve precision. The UI
// treats price / latitude / longitude / safety_score as real numbers (Leaflet
// markers and currency formatting both break on strings), and none of these
// columns need arbitrary precision, so parse them as floats.
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

/**
 * Serverless-safe Postgres pool.
 *
 * Each Vercel lambda instance gets one pool, cached on globalThis so that
 * hot invocations reuse connections instead of opening a new one per request.
 * Use a *pooled* connection string (e.g. Neon's `-pooler` host) so that
 * concurrent lambdas don't exhaust the database's connection limit.
 */
declare global {
  // eslint-disable-next-line no-var
  var __moveinPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

export const getPool = (): Pool => {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to frontend/.env.local for local dev, " +
        "and to the Vercel project's environment variables for deploys."
    );
  }

  if (!global.__moveinPool) {
    global.__moveinPool = new Pool({
      connectionString,
      // Managed Postgres (Neon/Supabase/Vercel) terminates TLS with its own CA.
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return global.__moveinPool;
};

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> => {
  const result = await getPool().query<T>(text, params);
  return result.rows;
};

export const queryOne = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
};
