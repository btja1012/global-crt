import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "",
  ssl: { rejectUnauthorized: false },
  max: 3,
});

export const db = drizzle(pool, { schema });
