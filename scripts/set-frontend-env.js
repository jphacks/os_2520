const fs = require('fs');
const path = require('path');

// 本番環境かどうかを判定
const isProduction = process.env.NODE_ENV === 'production';

// フロントエンドの.envファイルパス
const frontendEnvPath = path.join(__dirname, '..', 'front', '.env');

// 本番環境の場合
if (isProduction) {
  // HerokuのアプリURLを動的に取得
  const herokuAppName = process.env.HEROKU_APP_NAME;
  const backendUrl = herokuAppName 
    ? `https://${herokuAppName}.herokuapp.com`
    : 'https://your-app-name.herokuapp.com'; // フォールバック

  const envContent = `# バックエンドAPI URL (本番環境)
VITE_BACKEND_URL=${backendUrl}
`;

  console.log(`Setting production backend URL: ${backendUrl}`);
  fs.writeFileSync(frontendEnvPath, envContent);
} else {
  // 開発環境の場合（既存の.envファイルがない場合のみ作成）
  if (!fs.existsSync(frontendEnvPath)) {
    const envContent = `# バックエンドAPI URL (開発環境)
VITE_BACKEND_URL=http://localhost:3000
`;
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log('Created development .env file');
  } else {
    console.log('Development .env file already exists');
  }
}