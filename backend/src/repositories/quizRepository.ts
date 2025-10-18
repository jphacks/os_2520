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

  return { createQuiz, getUserById, getGroupMembersByGroupId, getUserGroupMembership, getPendingQuiz } as const;
};
