import bcrypt from 'bcrypt';
import crypto from 'crypto';

// グループIDを生成する関数（8文字の英数字）
const generateGroupId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
};

export const createGroupService = (groupRepository: {
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
  // 新規グループを作成する
  const createNewGroup = async (
    userId: string,
    groupName: string,
    password: string,
    alertFrequencyDays: number
  ) => {
    // グループ名のバリデーション
    if (!groupName || groupName.trim().length === 0) {
      throw new Error('グループ名は必須です。');
    }

    // パスワードのバリデーション
    if (!password || password.length < 8) {
      throw new Error('パスワードは8文字以上である必要があります。');
    }

    // alertFrequencyDaysのバリデーション
    if (alertFrequencyDays < 0.5) {
      throw new Error('アラート頻度は0.5日以上である必要があります。');
    }

    // ユニークなグループIDを生成（重複しないまで試行）
    let groupId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      groupId = generateGroupId();
      const existingGroup = await groupRepository.findGroupByGroupId(groupId);
      if (!existingGroup) {
        break;
      }
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('グループIDの生成に失敗しました。再度お試しください。');
      }
    } while (true);

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // グループを作成
    const group = await groupRepository.createGroup({
      groupId,
      groupName: groupName.trim(),
      passwordHash,
      alertFrequencyDays,
    });

    // グループメンバーを作成（実行ユーザーをオーナーとして登録）
    await groupRepository.createGroupMember({
      userId,
      groupId: group.id,
      isOwner: true,
    });

    return {
      id: group.id,
      groupId: group.groupId,
      groupName: group.groupName,
    };
  };

  // 既存グループに参加する
  const joinGroup = async (userId: string, groupId: string, password: string) => {
    // groupIdのバリデーション
    if (!groupId || groupId.trim().length === 0) {
      throw new Error('グループIDは必須です。');
    }

    // パスワードのバリデーション
    if (!password || password.trim().length === 0) {
      throw new Error('パスワードは必須です。');
    }

    // グループの存在確認
    const group = await groupRepository.findGroupByGroupId(groupId.trim());
    if (!group) {
      throw new Error('グループが見つかりません。');
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, group.passwordHash);
    if (!isPasswordValid) {
      throw new Error('パスワードが正しくありません。');
    }

    // すでにグループに参加しているか確認
    const existingMember = await groupRepository.findGroupMemberByUserIdAndGroupId(userId, group.id);
    if (existingMember) {
      throw new Error('既にこのグループに参加しています。');
    }

    // グループメンバーを作成（オーナーではない）
    await groupRepository.createGroupMember({
      userId,
      groupId: group.id,
      isOwner: false,
    });

    return {
      message: 'Successfully joined group',
    };
  };

  // グループメンバーの正答率ランキングを取得する
  const getMemberStats = async (userId: string) => {
    // ユーザーのグループメンバーシップを確認
    const membership = await groupRepository.getUserGroupMembership(userId);
    if (!membership) {
      throw new Error('グループに所属していません。');
    }

    // グループメンバーと回答統計を取得
    const members = await groupRepository.getGroupMembersWithAnswerStats(membership.groupId);

    // 各メンバーの正答率を計算
    const stats = members.map((member) => {
      const answers = member.user.answers;
      const totalAnswers = answers.length;
      const correctAnswers = answers.filter((answer: any) => answer.isCorrect).length;

      // 正答率を計算（回答がない場合は0）
      const correctRate = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

      return {
        userId: member.user.id,
        displayName: member.user.displayName,
        correctRate: Math.round(correctRate * 100) / 100, // 小数点第2位まで
      };
    });

    // 正答率でソート（降順）
    stats.sort((a, b) => b.correctRate - a.correctRate);

    return {
      members: stats,
    };
  };

  return { createNewGroup, joinGroup, getMemberStats } as const;
};
