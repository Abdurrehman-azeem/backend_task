import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { Schema } from './schema';

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD
} = process.env;

const pgConn = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432'),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

export const drizzle_client = drizzle({ client: pgConn, schema: Schema });
