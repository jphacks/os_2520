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

  return { createNewGroup } as const;
};
