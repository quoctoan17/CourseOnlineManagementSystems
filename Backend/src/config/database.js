import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pkg;

// PostgreSQL setup - đảm bảo password luôn là string (pg yêu cầu)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'courses_online_management_systems',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD != null ? String(process.env.DB_PASSWORD) : '',
});

pool.on('connect', () => {
  console.log('-- PostgreSQL database connected successfully --');
});

pool.on('error', (err) => {
  console.error('-- Unexpected error on idle client --', err);
  process.exit(-1);
});

export default pool;
