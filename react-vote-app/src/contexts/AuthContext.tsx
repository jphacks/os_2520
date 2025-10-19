import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "../lib/axios";

/**
 * ユーザー情報の型定義
 */
interface User {
  userId: string;
  role: "grandparent" | "family";
  lineId: string;
  hasGroup: boolean; // グループに所属しているか
  groupId: string | null; // 所属しているグループのID
}

/**
 * AuthContext の型定義
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider コンポーネント
 *
 * アプリ全体の認証状態を管理します。
 * - ページリロード時に /users/me を呼び出して認証状態を復元
 * - ログイン・ログアウト機能を提供
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * ユーザー情報を取得して認証状態を復元
   */
  const refreshUser = async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUser(response.data);
    } catch (error) {
      // 認証エラーの場合はログアウト状態にする
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ページリロード時に認証状態を復元
   */
  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * ログイン処理
   */
  const login = (userData: User) => {
    setUser(userData);
  };

  /**
   * ログアウト処理
   * TODO: バックエンドにログアウトAPIを実装したら呼び出す
   */
  const logout = () => {
    setUser(null);
    // TODO: CookieをクリアするためにバックエンドのログアウトAPIを呼び出す
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * AuthContext を使用するためのカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
