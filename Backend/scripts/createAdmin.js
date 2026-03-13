import pkg from 'pg';
import { hashPassword } from '../src/utils/auth.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env - luôn dùng đường dẫn tương đối từ vị trí file này (Backend/scripts/createAdmin.js)
const __dirname = dirname(fileURLToPath(import.meta.url));
//dotenv.config({ path: join(__dirname, '..', '.env') });
const envPath = join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });
console.log('📄 env path:', envPath);
console.log('📄 dotenv result:', result.error || '✅ OK');
console.log('🔑 DB_PASSWORD:', process.env.DB_PASSWORD);


const { Pool } = pkg;

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@elearning.com';
  const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'Admin123!';

  if (!email || !password) {
    console.error('Cần ADMIN_EMAIL và ADMIN_PASSWORD (env hoặc args).');
    process.exit(1);
  }

  // pg yêu cầu password phải là string, không được undefined
  const dbPassword = process.env.DB_PASSWORD;
  if (dbPassword === undefined || dbPassword === null) {
    console.error('❌ DB_PASSWORD không tìm thấy trong .env. Kiểm tra file Backend/.env');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'courses_online_management_systems',
    user: process.env.DB_USER || 'postgres',
    password: String(dbPassword),
  });

  const client = await pool.connect();

  try {
    console.log('🔄 Đang tạo/cập nhật tài khoản admin...');

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Kiểm tra user đã tồn tại
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      // Cập nhật
      await client.query(
        'UPDATE users SET password = $1, role = $2 WHERE email = $3',
        [hashedPassword, 'admin', email]
      );
      console.log(`✅ Đã cập nhật tài khoản admin: ${email}`);
    } else {
      // Tạo mới
      await client.query(
        'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Administrator', email, hashedPassword, 'admin']
      );
      console.log(`✅ Đã tạo tài khoản admin: ${email}`);
    }

    console.log('✨ Hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin();