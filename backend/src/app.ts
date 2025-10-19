import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
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

// 静的ファイルの配信（本番環境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../front/dist')));
}

app.use('/', router);

// 本番環境では全てのルートでReactアプリを配信
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

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