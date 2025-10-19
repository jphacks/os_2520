import type { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

// クイズリポジトリの作成
export const createQuizRepository = (quizRepo?: {
  createQuiz: (data: {
    groupId: string;
    grandparentId: string;
    questionText: string;
    options: { optionText: string; isCorrect: boolean }[];
  }) => Promise<any>;
  getUserById: (userId: string) => Promise<any | null>;
  getGroupMembersByGroupId: (groupId: string) => Promise<any[]>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  getPendingQuiz: (userId: string, groupId: string) => Promise<any | null>;
  getQuizById: (quizId: string) => Promise<any | null>;
  getQuizOptionById: (optionId: string) => Promise<any | null>;
  checkExistingAnswer: (quizId: string, userId: string) => Promise<any | null>;
  createAnswer: (data: {
    quizId: string;
    familyMemberId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    message?: string;
  }) => Promise<any>;
  getQuizHistory: (groupId: string, page: number, limit: number) => Promise<{ quizzes: any[]; total: number }>;
}) => {
  const backing =
    quizRepo ??
    (async () => {
      return {
        createQuiz: async (data: {
          groupId: string;
          grandparentId: string;
          questionText: string;
          options: { optionText: string; isCorrect: boolean }[];
        }) => {
          // クイズと選択肢を同時に作成
          return prisma.quiz.create({
            data: {
              groupId: data.groupId,
              grandparentId: data.grandparentId,
              questionText: data.questionText,
              options: {
                create: data.options,
              },
            },
            include: {
              options: true,
            },
          });
        },
        getUserById: (userId: string) => prisma.user.findUnique({ where: { id: userId } }),
        getGroupMembersByGroupId: (groupId: string) =>
          prisma.groupMember.findMany({
            where: { groupId },
            include: {
              user: true,
            },
          }),
        getUserGroupMembership: (userId: string) =>
          prisma.groupMember.findFirst({
            where: { userId },
            include: {
              group: true,
            },
          }),
        getPendingQuiz: async (userId: string, groupId: string) => {
          // ユーザーが未回答の最新クイズを1件取得
          // 1. グループ内の全クイズを取得
          // 2. ユーザーが回答していないクイズをフィルタリング
          // 3. 最新のクイズを1件返す
          return prisma.quiz.findFirst({
            where: {
              groupId,
              // ユーザーの回答が存在しないクイズ
              answers: {
                none: {
                  familyMemberId: userId,
                },
              },
            },
            orderBy: {
              createdAt: 'desc', // 最新のクイズを取得
            },
            include: {
              options: {
                select: {
                  id: true,
                  optionText: true,
                  // isCorrectは含めない（回答前なので）
                },
              },
              grandparent: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          });
        },
        getQuizById: (quizId: string) =>
          prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
              options: true,
            },
          }),
        getQuizOptionById: (optionId: string) => prisma.quizOption.findUnique({ where: { id: optionId } }),
        checkExistingAnswer: (quizId: string, userId: string) =>
          prisma.answer.findUnique({
            where: {
              quizId_familyMemberId: {
                quizId,
                familyMemberId: userId,
              },
            },
          }),
        createAnswer: (data: {
          quizId: string;
          familyMemberId: string;
          selectedOptionId: string;
          isCorrect: boolean;
          message?: string;
        }) =>
          prisma.answer.create({
            data,
          }),
        getQuizHistory: async (groupId: string, page: number, limit: number) => {
          const skip = (page - 1) * limit;

          // 総数を取得
          const total = await prisma.quiz.count({
            where: { groupId },
          });

          // クイズ一覧を取得（ページネーション付き）
          const quizzes = await prisma.quiz.findMany({
            where: { groupId },
            orderBy: {
              createdAt: 'desc', // 新しい順
            },
            skip,
            take: limit,
            include: {
              grandparent: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
              answers: {
                include: {
                  familyMember: {
                    select: {
                      id: true,
                      displayName: true,
                    },
                  },
                  selectedOption: {
                    select: {
                      id: true,
                      optionText: true,
                    },
                  },
                },
              },
            },
          });

          return { quizzes, total };
        },
      };
    })();

  const getBacking = async () => (backing instanceof Promise ? await backing : backing);

  const createQuiz = async (data: {
    groupId: string;
    grandparentId: string;
    questionText: string;
    options: { optionText: string; isCorrect: boolean }[];
  }) => {
    const impl = await getBacking();
    return impl.createQuiz(data);
  };

  const getUserById = async (userId: string) => {
    const impl = await getBacking();
    return impl.getUserById(userId);
  };

  const getGroupMembersByGroupId = async (groupId: string) => {
    const impl = await getBacking();
    return impl.getGroupMembersByGroupId(groupId);
  };

  const getUserGroupMembership = async (userId: string) => {
    const impl = await getBacking();
    return impl.getUserGroupMembership(userId);
  };

  const getPendingQuiz = async (userId: string, groupId: string) => {
    const impl = await getBacking();
    return impl.getPendingQuiz(userId, groupId);
  };

  const getQuizById = async (quizId: string) => {
    const impl = await getBacking();
    return impl.getQuizById(quizId);
  };

  const getQuizOptionById = async (optionId: string) => {
    const impl = await getBacking();
    return impl.getQuizOptionById(optionId);
  };

  const checkExistingAnswer = async (quizId: string, userId: string) => {
    const impl = await getBacking();
    return impl.checkExistingAnswer(quizId, userId);
  };

  const createAnswer = async (data: {
    quizId: string;
    familyMemberId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    message?: string;
  }) => {
    const impl = await getBacking();
    return impl.createAnswer(data);
  };

  const getQuizHistory = async (groupId: string, page: number, limit: number) => {
    const impl = await getBacking();
    return impl.getQuizHistory(groupId, page, limit);
  };

  const updateUserPoints = async (userId: string, points: number) => {
    return prisma.user.update({ where: { id: userId }, data: { points } });
  };

  const getOldestPendingQuizRequest = async (groupId: string) => {
    return prisma.quizRequest.findFirst({
      where: {
        groupId,
        requestType: 'quiz',
        isHandled: false,
      },
      orderBy: {
        createdAt: 'asc',
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

  const markRequestAsHandled = async (requestId: string, quizId: string) => {
    return prisma.quizRequest.update({
      where: { id: requestId },
      data: {
        isHandled: true,
        handledQuizId: quizId,
      },
    });
  };

  return {
    createQuiz,
    getUserById,
    getGroupMembersByGroupId,
    getUserGroupMembership,
    getPendingQuiz,
    getQuizById,
    getQuizOptionById,
    checkExistingAnswer,
    createAnswer,
    getQuizHistory,
    updateUserPoints,
    getOldestPendingQuizRequest,
    markRequestAsHandled,
  } as const;
};
