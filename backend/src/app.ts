import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index';
import prisma from './prismaClient';
import { initQuizAlertCron } from './jobs/quizAlertCron';

const app = express();

// CORS設定: フロントエンドからのリクエストを許可し、Cookieの送受信を有効化
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true  // Cookieをフロントエンドとやりとりするためにtrueにする
}));

// ミドルウェア設定
app.use(express.json());
app.use(cookieParser());  // Cookieをパースするミドルウェア
app.use('/', router);

const server = app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');

  // cronジョブの初期化
  try {
    initQuizAlertCron();
    console.log('Cron jobs initialized successfully');
  } catch (error: any) {
    console.error('Failed to initialize cron jobs:', error.message);
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);