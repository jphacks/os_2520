import express, { Request, Response } from 'express';
import router from './routes/index';

const app = express();

app.use(express.json());
app.use('/', router);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});