import axios from 'axios';

/**
 * axios インスタンス
 *
 * 全てのAPIリクエストでCookieの送受信を有効化するために、
 * withCredentials: true を設定したaxiosインスタンスを作成します。
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // 全てのリクエストでCookieの送受信を有効化
});

export default apiClient;
