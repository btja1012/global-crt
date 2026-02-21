import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash varchar NOT NULL DEFAULT '',
  DROP COLUMN IF EXISTS profile_image_url;
`);
await pool.query(`ALTER TABLE users ALTER COLUMN email SET NOT NULL;`);
await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;`);
await pool.query(`DROP TABLE IF EXISTS sessions;`);
console.log('Migration complete');
await pool.end();
