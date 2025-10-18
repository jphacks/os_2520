import jwt from 'jsonwebtoken';
import { createAuthRepository } from '../repositories/authRepository';

type VerifyResult = { lineId: string; displayName?: string };

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_EXPIRES_IN = '7d';

// Line IDトークンの検証（モック実装）
// 未実装
// TODO

export const verifyLineIdToken = async (idToken: string): Promise<VerifyResult> => {
  if (!idToken || idToken === 'invalid') {
    const e: any = new Error('Invalid idToken');
    e.code = 'UNAUTHORIZED';
    throw e;
  }
  return { lineId: `line-${idToken}`, displayName: `MockUser-${idToken.slice(0, 6)}` };
};

type AuthRepoShape = {
  findUserByLineId: (lineId: string) => Promise<any | null>;
  createUser: (data: { lineId: string; displayName: string; role: string }) => Promise<any>;
};

export const createAuthService = (repo: AuthRepoShape | (() => AuthRepoShape | Promise<AuthRepoShape>) = createAuthRepository()) => {
  const loginWithLine = async (idToken: string) => {
    const repository: AuthRepoShape = typeof repo === 'function' ? await (repo() as Promise<AuthRepoShape>) : repo;
    const payload = await verifyLineIdToken(idToken);
    const { lineId, displayName } = payload;

    let user = await repository.findUserByLineId(lineId);
    let isNewUser = false;
    if (!user) {
      user = await repository.createUser({ lineId, displayName: displayName ?? '', role: 'family' });
      isNewUser = true;
    }

    const token = jwt.sign({ userId: user.id, lineId: user.lineId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return { token, isNewUser, user };
  };

  return { loginWithLine } as const;
};
