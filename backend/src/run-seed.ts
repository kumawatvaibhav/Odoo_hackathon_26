import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "traveloop",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

async function runSeed() {
  try {
    const seedSql = fs.readFileSync(path.resolve('../database/019_trip_activities.sql'), 'utf-8');
    await pool.query(seedSql);
    console.log('Seed data inserted successfully!');
  } catch (err) {
    console.error('Error inserting seed data:', err);
  } finally {
    pool.end();
  }
}

runSeed();
