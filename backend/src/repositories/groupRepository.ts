import type { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

// グループリポジトリの作成
export const createGroupRepository = (groupRepo?: {
  createGroup: (data: {
    groupId: string;
    groupName: string;
    passwordHash: string;
    alertFrequencyDays: number;
  }) => Promise<any>;
  createGroupMember: (data: { userId: string; groupId: string; isOwner: boolean }) => Promise<any>;
  findGroupByGroupId: (groupId: string) => Promise<any | null>;
  findGroupMemberByUserIdAndGroupId: (userId: string, groupId: string) => Promise<any | null>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  getGroupMembersWithAnswerStats: (groupId: string) => Promise<any[]>;
}) => {
  const backing =
    groupRepo ??
    (async () => {
      return {
        createGroup: (data: {
          groupId: string;
          groupName: string;
          passwordHash: string;
          alertFrequencyDays: number;
        }) =>
          prisma.group.create({
            data,
          }),
        createGroupMember: (data: { userId: string; groupId: string; isOwner: boolean }) =>
          prisma.groupMember.create({
            data,
          }),
        findGroupByGroupId: (groupId: string) => prisma.group.findUnique({ where: { groupId } }),
        findGroupMemberByUserIdAndGroupId: (userId: string, groupId: string) =>
          prisma.groupMember.findUnique({
            where: {
              userId_groupId: {
                userId,
                groupId,
              },
            },
          }),
        // ユーザーのグループメンバーシップを取得
        getUserGroupMembership: (userId: string) =>
          prisma.groupMember.findFirst({
            where: { userId },
            include: { group: true },
          }),
        // グループメンバーの回答統計を取得
        getGroupMembersWithAnswerStats: (groupId: string) =>
          prisma.groupMember.findMany({
            where: { groupId },
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  answers: {
                    where: {
                      quiz: {
                        groupId,
                      },
                    },
                    select: {
                      isCorrect: true,
                    },
                  },
                },
              },
            },
          }),
      };
    })();

  const getBacking = async () => (backing instanceof Promise ? await backing : backing);

  const createGroup = async (data: {
    groupId: string;
    groupName: string;
    passwordHash: string;
    alertFrequencyDays: number;
  }) => {
    const impl = await getBacking();
    return impl.createGroup(data as any);
  };

  const createGroupMember = async (data: { userId: string; groupId: string; isOwner: boolean }) => {
    const impl = await getBacking();
    return impl.createGroupMember(data as any);
  };

  const findGroupByGroupId = async (groupId: string) => {
    const impl = await getBacking();
    return impl.findGroupByGroupId(groupId);
  };

  const findGroupMemberByUserIdAndGroupId = async (userId: string, groupId: string) => {
    const impl = await getBacking();
    return impl.findGroupMemberByUserIdAndGroupId(userId, groupId);
  };

  const getUserGroupMembership = async (userId: string) => {
    const impl = await getBacking();
    return impl.getUserGroupMembership(userId);
  };

  const getGroupMembersWithAnswerStats = async (groupId: string) => {
    const impl = await getBacking();
    return impl.getGroupMembersWithAnswerStats(groupId);
  };

  return {
    createGroup,
    createGroupMember,
    findGroupByGroupId,
    findGroupMemberByUserIdAndGroupId,
    getUserGroupMembership,
    getGroupMembersWithAnswerStats,
  } as const;
};
