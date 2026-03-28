import pool from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔄 Đang tạo database schema...');

    // USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        full_name   VARCHAR(255) NOT NULL,
        email       VARCHAR(255) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(50)  NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table users tạo thành công');

    // CATEGORIES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);
    console.log('✅ Table categories tạo thành công');

    // COURSES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id             SERIAL PRIMARY KEY,
        title          VARCHAR(255) NOT NULL,
        description    TEXT,
        thumbnail      VARCHAR(500),
        instructor_id  INT NOT NULL,
        category_id    INT,
        status         VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_courses_instructor
          FOREIGN KEY (instructor_id) REFERENCES users(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_courses_category
          FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL
      );
    `);
    // Migration: thêm cột status nếu bảng courses đã tồn tại (DB cũ không có status)
    await client.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active'`);
    try {
      await client.query(`ALTER TABLE courses ADD CONSTRAINT courses_status_check CHECK (status IN ('active', 'inactive'))`);
    } catch (e) {
      if (e.code !== '42710') throw e; // 42710 = duplicate_object, bỏ qua nếu constraint đã có
    }
    console.log('✅ Table courses tạo thành công');

    // LESSONS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id            SERIAL PRIMARY KEY,
        course_id     INT NOT NULL,
        title         VARCHAR(255) NOT NULL,
        video_url     VARCHAR(500),
        lesson_order  INT NOT NULL DEFAULT 1,

        CONSTRAINT fk_lessons_course
          FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE CASCADE
      );
    `);
    console.log('✅ Table lessons tạo thành công');

    // ENROLLMENTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id           SERIAL PRIMARY KEY,
        user_id      INT NOT NULL,
        course_id    INT NOT NULL,
        enrolled_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status       VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),

        CONSTRAINT fk_enrollments_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_enrollments_course
          FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE CASCADE,

        CONSTRAINT uq_enrollments UNIQUE (user_id, course_id)
      );
    `);
    console.log('✅ Table enrollments tạo thành công');

    // PROGRESS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id            SERIAL PRIMARY KEY,
        user_id       INT NOT NULL,
        lesson_id     INT NOT NULL,
        completed     BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at  TIMESTAMP,

        CONSTRAINT fk_progress_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_progress_lesson
          FOREIGN KEY (lesson_id) REFERENCES lessons(id)
          ON DELETE CASCADE,

        CONSTRAINT uq_progress UNIQUE (user_id, lesson_id)
      );
    `);
    console.log('✅ Table progress tạo thành công');

    // Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_instructor   ON courses(instructor_id);
      CREATE INDEX IF NOT EXISTS idx_courses_category     ON courses(category_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_course       ON lessons(course_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_order        ON lessons(course_id, lesson_order);
      CREATE INDEX IF NOT EXISTS idx_enrollments_user     ON enrollments(user_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course   ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_progress_user        ON progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_progress_lesson      ON progress(lesson_id);
    `);
    console.log('✅ Indexes tạo thành công');

    console.log('\n✨ Database setup hoàn tất!\n');
  } catch (error) {
    console.error('❌ Lỗi khi tạo database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
