import { Router, Request, Response } from 'express';
import { getHelloWorld } from '../controllers/index';
import { createAuthController } from '../controllers/authController';
import { createAuthService } from '../services/authService';
import { createAuthRepository } from '../repositories/authRepository';
import { createGroupController } from '../controllers/groupController';
import { createGroupService } from '../services/groupService';
import { createGroupRepository } from '../repositories/groupRepository';
import { createQuizController } from '../controllers/quizController';
import { createQuizService } from '../services/quizService';
import { createQuizRepository } from '../repositories/quizRepository';
import { createAlertController } from '../controllers/alertController';
import { createAlertService } from '../services/alertService';
import { createAlertRepository } from '../repositories/alertRepository';
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
router.get('/users/me', authMiddleware, authController.getMe);
router.put('/users/me/profile', authMiddleware, authController.putMyProfile);

// Group DI container
const groupRepo = createGroupRepository();
const groupService = createGroupService(groupRepo);
const groupController = createGroupController(groupService);

router.post('/groups', authMiddleware, groupController.postGroup);
router.post('/groups/join', authMiddleware, groupController.postGroupJoin);
router.get('/groups/stats/members', authMiddleware, groupController.getGroupStatsMembers);

// Quiz DI container
const quizRepo = createQuizRepository();
const quizService = createQuizService(quizRepo);
const quizController = createQuizController(quizService);

router.post('/quizzes', authMiddleware, quizController.postQuiz);
router.get('/quizzes/pending', authMiddleware, quizController.getPendingQuiz);
router.get('/quizzes/history', authMiddleware, quizController.getQuizHistory);
router.post('/quizzes/:quizId/answer', authMiddleware, quizController.postQuizAnswer);

// Alert DI container
const alertRepo = createAlertRepository();
const alertService = createAlertService(alertRepo);
const alertController = createAlertController(alertService);

router.post('/alerts/emergency', authMiddleware, alertController.postEmergencyAlert);

export default router;