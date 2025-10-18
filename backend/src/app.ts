import 'dotenv/config';
import express from 'express';
import router from './routes/index';
import prisma from './prismaClient';

const app = express();

app.use(express.json());
app.use('/', router);

const server = app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);