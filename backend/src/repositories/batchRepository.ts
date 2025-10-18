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
   * グループの祖父母メンバーを取得（role='grandparent'のみ）
   *
   * @param groupId - グループID
   */
  const getGroupGrandparents = async (groupId: string) => {
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        user: {
          role: 'grandparent', // grandparentのみ
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
   * 特定グループ・タイプの最新アラート履歴を取得
   *
   * @param groupId - グループID
   * @param type - アラートタイプ
   */
  const getLatestAlertByGroupAndType = async (groupId: string, type: string) => {
    const alert = await prisma.alertHistory.findFirst({
      where: {
        groupId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return alert;
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
    getGroupGrandparents,
    getLatestAlertByGroupAndType,
    createAlertHistory,
  } as const;
};
