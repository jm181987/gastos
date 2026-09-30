import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurada. Añádela en Vercel > Settings > Environment Variables.');
}

const globalForPg = globalThis;

export const pool =
  globalForPg.__gastosPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.__gastosPool = pool;
