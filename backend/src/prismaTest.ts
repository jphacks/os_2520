import 'dotenv/config';
import prisma from './prismaClient';

console.log('CWD:', process.cwd());
console.log('Loaded .env values:');
console.log('DATABASE_URL=', process.env.DATABASE_URL);

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected. Running test...');

    // SQLite 用の簡単なテスト：User テーブルの件数を取得
    const count = await prisma.user.count();
    console.log('Users count:', count);
  } catch (err) {
    console.error('Prisma test error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected.');
  }
}

main();
