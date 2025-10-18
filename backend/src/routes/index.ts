import { Router, Request, Response } from 'express';
import { getHelloWorld } from '../controllers/index';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello from the routes!');
});

router.get('/hello', getHelloWorld);

export default router;