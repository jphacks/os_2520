import jwt from "jsonwebtoken";
import axios from "axios";
import { createAuthRepository } from "../repositories/authRepository";

type VerifyResult = { lineId: string; displayName?: string };

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = "7d";
const LINE_CHANNEL_ID = process.env.LINE_CLIENT_ID ?? "";

/**
 * LINE IDトークンを検証してユーザー情報を取得
 */
export const verifyLineIdToken = async (
  idToken: string
): Promise<VerifyResult> => {
  if (!idToken) {
    const e: any = new Error("Invalid idToken");
    e.code = "UNAUTHORIZED";
    throw e;
  }

  try {
    // LINE公式のIDトークン検証エンドポイント
    const response = await axios.post(
      "https://api.line.me/oauth2/v2.1/verify",
      new URLSearchParams({
        id_token: idToken,
        client_id: LINE_CHANNEL_ID,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { sub, name } = response.data;

    if (!sub) {
      const e: any = new Error("Invalid idToken: missing sub claim");
      e.code = "UNAUTHORIZED";
      throw e;
    }

    // sub がLINEユーザーID（ボットリンク設定時はMessaging APIと共通）
    return {
      lineId: sub,
      displayName: name || undefined,
    };
  } catch (error: any) {
    if (error.code === "UNAUTHORIZED") {
      throw error;
    }

    console.error(
      "LINE ID token verification failed:",
      error.response?.data || error.message
    );
    const e: any = new Error("Invalid idToken");
    e.code = "UNAUTHORIZED";
    throw e;
  }
};

type AuthRepoShape = {
  findUserByLineId: (lineId: string) => Promise<any | null>;
  createUser: (data: {
    lineId: string;
    displayName: string;
    role: string;
  }) => Promise<any>;
  updateUserProfile?: (
    userId: string,
    data: { displayName?: string; role?: string }
  ) => Promise<any>;
};

export const createAuthService = (
  repo:
    | AuthRepoShape
    | (() => AuthRepoShape | Promise<AuthRepoShape>) = createAuthRepository()
) => {
  const loginWithLine = async (idToken: string) => {
    const repository: AuthRepoShape =
      typeof repo === "function"
        ? await (repo() as Promise<AuthRepoShape>)
        : repo;
    const payload = await verifyLineIdToken(idToken);
    const { lineId, displayName } = payload;

    let user = await repository.findUserByLineId(lineId);
    let isNewUser = false;
    if (!user) {
      user = await repository.createUser({
        lineId,
        displayName: displayName ?? "",
        role: "family",
      });
      isNewUser = true;
    }

    const token = jwt.sign(
      { userId: user.id, lineId: user.lineId, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, isNewUser, user };
  };

  const updateProfile = async (
    userId: string,
    payload: { displayName?: string; role?: string }
  ) => {
    const repository: AuthRepoShape =
      typeof repo === "function"
        ? await (repo() as Promise<AuthRepoShape>)
        : repo;
    const { displayName, role } = payload ?? {};

    if (
      !displayName ||
      typeof displayName !== "string" ||
      displayName.trim() === ""
    ) {
      const e: any = new Error("displayName is required");
      e.code = "BAD_REQUEST";
      throw e;
    }
    if (!role || !["grandparent", "family"].includes(role)) {
      const e: any = new Error("invalid role");
      e.code = "BAD_REQUEST";
      throw e;
    }
    if (!repository.updateUserProfile) {
      const e: any = new Error("update not supported");
      e.code = "INTERNAL";
      throw e;
    }

    const user = await repository.updateUserProfile(userId, {
      displayName: displayName.trim(),
      role,
    });

    // 新しいJWTトークンを発行（roleが変更された可能性があるため）
    const token = jwt.sign(
      { userId: user.id, lineId: user.lineId, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { user, token };
  };

  return { loginWithLine, updateProfile } as const;
};
