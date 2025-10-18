import prisma from '../prismaClient';

/**
 * バッチ処理用のリポジトリ
 */
export const createBatchRepository = () => {
  /**
   * 全グループと最新のクイズ情報を取得
   */
  const getAllGroupsWithLatestQuiz = async () => {
    const groups = await prisma.group.findMany({
      include: {
        quizzes: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // 最新のクイズのみ取得
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                lineId: true,
                displayName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return groups;
  };

  /**
   * グループの家族メンバーを取得（grandparent除く）
   *
   * @param groupId - グループID
   */
  const getGroupFamilyMembers = async (groupId: string) => {
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        user: {
          role: {
            not: 'grandparent', // grandparentを除外
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            lineId: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    return members;
  };

  /**
   * AlertHistoryを作成
   *
   * @param data - アラート履歴データ
   */
  const createAlertHistory = async (data: { groupId: string; type: string }) => {
    return prisma.alertHistory.create({
      data: {
        groupId: data.groupId,
        type: data.type,
        triggeredByUserId: null, // バッチ処理なのでnull
      },
    });
  };

  return {
    getAllGroupsWithLatestQuiz,
    getGroupFamilyMembers,
    createAlertHistory,
  } as const;
};
