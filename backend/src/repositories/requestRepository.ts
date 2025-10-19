import prisma from '../prismaClient';

/**
 * リクエストリポジトリの作成
 */
export const createRequestRepository = () => {
  /**
   * リクエストを作成
   */
  const createRequest = async (data: {
    userId: string;
    groupId: string;
    requestType: 'quiz' | 'other';
    content: string;
  }) => {
    return prisma.quizRequest.create({
      data,
    });
  };

  /**
   * グループの未対応クイズリクエストを取得（古い順）
   */
  const getPendingQuizRequests = async (groupId: string) => {
    return prisma.quizRequest.findMany({
      where: {
        groupId,
        requestType: 'quiz',
        isHandled: false,
      },
      orderBy: {
        createdAt: 'asc', // 古い順
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            lineId: true,
          },
        },
      },
    });
  };

  /**
   * 最も古い未対応クイズリクエストを取得
   */
  const getOldestPendingQuizRequest = async (groupId: string) => {
    return prisma.quizRequest.findFirst({
      where: {
        groupId,
        requestType: 'quiz',
        isHandled: false,
      },
      orderBy: {
        createdAt: 'asc', // 最も古いもの
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            lineId: true,
          },
        },
      },
    });
  };

  /**
   * リクエストを処理済みにする
   */
  const markRequestAsHandled = async (requestId: string, quizId: string) => {
    return prisma.quizRequest.update({
      where: { id: requestId },
      data: {
        isHandled: true,
        handledQuizId: quizId,
      },
    });
  };

  /**
   * リクエストIDでリクエストを取得
   */
  const getRequestById = async (requestId: string) => {
    return prisma.quizRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            lineId: true,
          },
        },
      },
    });
  };

  /**
   * グループの祖父母を取得
   */
  const getGrandparents = async (groupId: string) => {
    return prisma.groupMember.findMany({
      where: {
        groupId,
        user: {
          role: 'grandparent',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            lineId: true,
          },
        },
      },
    });
  };

  return {
    createRequest,
    getPendingQuizRequests,
    getOldestPendingQuizRequest,
    markRequestAsHandled,
    getRequestById,
    getGrandparents,
  } as const;
};
