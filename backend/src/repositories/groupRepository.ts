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

  return { createGroup, createGroupMember, findGroupByGroupId } as const;
};
