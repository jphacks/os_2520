import { Request, Response } from 'express';

export const getHelloWorld = (req: Request, res: Response) => {
  res.json({ message: 'hello world' });
};
