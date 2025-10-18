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

  return { createGroup, createGroupMember, findGroupByGroupId, findGroupMemberByUserIdAndGroupId } as const;
};
