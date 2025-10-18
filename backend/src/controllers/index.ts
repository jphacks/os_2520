import { Request, Response } from 'express';

export const getHelloWorld = (req: Request, res: Response): void => {
  res.send('Hello World!');
};