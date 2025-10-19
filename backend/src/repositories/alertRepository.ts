import type { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

// アラートリポジトリの作成
export const createAlertRepository = (alertRepo?: {
  createAlertHistory: (data: {
    groupId: string;
    type: string;
    triggeredByUserId: string;
  }) => Promise<any>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  getGroupFamilyMembers: (groupId: string) => Promise<any[]>;
}) => {
  const backing =
    alertRepo ??
    (async () => {
      return {
        // アラート履歴を作成
        createAlertHistory: (data: { groupId: string; type: string; triggeredByUserId: string }) =>
          prisma.alertHistory.create({
            data,
          }),
        // ユーザーのグループメンバーシップを取得
        getUserGroupMembership: (userId: string) =>
          prisma.groupMember.findFirst({
            where: { userId },
            include: { group: true },
          }),
        // グループの家族メンバーを取得（緊急通知の送信先）
        getGroupFamilyMembers: (groupId: string) =>
          prisma.groupMember.findMany({
            where: { groupId },
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  lineId: true,
                },
              },
            },
          }),
      };
    })();

  const getBacking = async () => (backing instanceof Promise ? await backing : backing);

  const createAlertHistory = async (data: { groupId: string; type: string; triggeredByUserId: string }) => {
    const impl = await getBacking();
    return impl.createAlertHistory(data as any);
  };

  const getUserGroupMembership = async (userId: string) => {
    const impl = await getBacking();
    return impl.getUserGroupMembership(userId);
  };

  const getGroupFamilyMembers = async (groupId: string) => {
    const impl = await getBacking();
    return impl.getGroupFamilyMembers(groupId);
  };

  return {
    createAlertHistory,
    getUserGroupMembership,
    getGroupFamilyMembers,
  } as const;
};
