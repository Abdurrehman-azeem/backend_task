import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'drizzle-kit';

const envPath = path.resolve(__dirname, '.env');
dotenv.config({
  path: envPath
});

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    user: process.env.DB_USER!,
    ssl: process.env.DB_SSL === "true",
  }
});
