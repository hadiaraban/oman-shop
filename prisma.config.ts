import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // مسیر دقیق فایل schema را مشخص می‌کند
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations', // مسیر پوشه migrations
  },
  datasource: {
    url: env('DATABASE_URL'), // اتصال به دیتابیس از طریق متغیر محیطی
  },
});