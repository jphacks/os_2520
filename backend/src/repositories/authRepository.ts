import type { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

type UserRecord = Prisma.UserCreateInput & { id?: number };

// it uses direct prisma calls as the default implementation.
export const createAuthRepository = (userRepo?: {
  findByLineId: (lineId: string) => Promise<any | null>;
  createUser: (data: { lineId: string; displayName: string; role: string }) => Promise<any>;
  updateUserProfile: (userId: string, data: { displayName?: string; role?: string }) => Promise<any>;
  getUserById: (userId: string) => Promise<any | null>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  updateUserPoints: (userId: string, points: number) => Promise<any>;
}) => {
  const backing =
    userRepo ??
    (async () => {
      return {
        findByLineId: (lineId: string) => prisma.user.findUnique({ where: { lineId } }),
        createUser: (data: { lineId: string; displayName: string; role: string }) => prisma.user.create({ data }),
        updateUserProfile: (userId: string, data: { displayName?: string; role?: string }) =>
          prisma.user.update({ where: { id: userId }, data: { displayName: data.displayName, role: data.role } }),
        getUserById: (userId: string) => prisma.user.findUnique({ where: { id: userId } }),
        getUserGroupMembership: (userId: string) =>
          prisma.groupMember.findFirst({
            where: { userId },
            include: {
              group: true,
            },
          }),
        updateUserPoints: (userId: string, points: number) =>
          prisma.user.update({ where: { id: userId }, data: { points } }),
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

  const getUserById = async (userId: string) => {
    const impl = await getBacking();
    return impl.getUserById(userId);
  };

  const getUserGroupMembership = async (userId: string) => {
    const impl = await getBacking();
    return impl.getUserGroupMembership(userId);
  };

  const updateUserPoints = async (userId: string, points: number) => {
    const impl = await getBacking();
    return impl.updateUserPoints(userId, points);
  };

  return {
    findUserByLineId,
    createUser,
    updateUserProfile,
    getUserById,
    getUserGroupMembership,
    updateUserPoints,
  } as const;
};
