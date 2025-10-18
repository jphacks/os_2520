import type { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

type UserRecord = Prisma.UserCreateInput & { id?: number };

// it uses direct prisma calls as the default implementation.
export const createAuthRepository = (userRepo?: {
  findByLineId: (lineId: string) => Promise<any | null>;
  createUser: (data: { lineId: string; displayName: string; role: string }) => Promise<any>;
  updateUserProfile: (userId: string, data: { displayName?: string; role?: string }) => Promise<any>;
}) => {
  const backing =
    userRepo ??
    (async () => {
      return {
        findByLineId: (lineId: string) => prisma.user.findUnique({ where: { lineId } }),
        createUser: (data: { lineId: string; displayName: string; role: string }) => prisma.user.create({ data }),
        updateUserProfile: (userId: string, data: { displayName?: string; role?: string }) =>
          prisma.user.update({ where: { id: userId }, data: { displayName: data.displayName, role: data.role } }),
      };
    })();

  const getBacking = async () => (backing instanceof Promise ? await backing : backing);

  const findUserByLineId = async (lineId: string) => {
    const impl = await getBacking();
    return impl.findByLineId(lineId);
  };

  const createUser = async (data: { lineId: string; displayName: string; role: string }) => {
    const impl = await getBacking();
    return impl.createUser(data as any);
  };

  const updateUserProfile = async (userId: string, data: { displayName?: string; role?: string }) => {
    const impl = await getBacking();
    return impl.updateUserProfile(userId, data);
  };

  return { findUserByLineId, createUser, updateUserProfile } as const;
};
