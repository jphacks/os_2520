import { Router, Request, Response } from 'express';
import { getHelloWorld } from '../controllers/index';
import { createAuthController } from '../controllers/authController';
import { createAuthService } from '../services/authService';
import { createAuthRepository } from '../repositories/authRepository';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Hello
router.get('/', (req: Request, res: Response) => {
	res.send('Hello from the routes!');
});
router.get('/hello', getHelloWorld);

// Auth DI container
const authRepo = createAuthRepository();
const authService = createAuthService(authRepo);
const authController = createAuthController(authService);

router.post('/auth/line', authController.postLineAuth);
router.put('/users/me/profile', authMiddleware, authController.putMyProfile);

export default router;