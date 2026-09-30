import pg from 'pg';

const { Pool } = pg;

const globalForPg = globalThis;

export const pool =
  globalForPg.__gastosPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.__gastosPool = pool;
