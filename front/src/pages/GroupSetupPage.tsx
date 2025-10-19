import { useNavigate } from 'react-router-dom';

/**
 * 家族グループ選択/作成画面
 *
 * フロントエンド設計書に基づき、以下の2つの選択肢を提供します:
 * - 新しい家族グループを作成
 * - 既存グループに参加
 */
const GroupSetupPage = () => {
  const navigate = useNavigate();

  /**
   * 「新しい家族グループを作成」ボタンクリック時の処理
   */
  const handleCreateGroup = () => {
    navigate('/group/create');
  };

  /**
   * 「既存グループに参加」ボタンクリック時の処理
   */
  const handleJoinGroup = () => {
    navigate('/group/join');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>家族グループの設定</h1>
        <p style={styles.subtitle}>
          家族グループを作成するか、既存のグループに参加してください
        </p>

        <div style={styles.buttonContainer}>
          {/* 新しい家族グループを作成ボタン */}
          <button
            onClick={handleCreateGroup}
            style={styles.primaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            <div style={styles.buttonIcon}>➕</div>
            <div style={styles.buttonText}>
              <div style={styles.buttonTitle}>新しい家族グループを作成</div>
              <div style={styles.buttonDescription}>
                代表者としてグループを作成し、家族を招待します
              </div>
            </div>
          </button>

          {/* 既存グループに参加ボタン */}
          <button
            onClick={handleJoinGroup}
            style={styles.secondaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <div style={styles.buttonIcon}>🔗</div>
            <div style={styles.buttonText}>
              <div style={styles.buttonTitle}>既存グループに参加</div>
              <div style={styles.buttonDescription}>
                招待されたグループIDを入力して参加します
              </div>
            </div>
          </button>
        </div>

        <div style={styles.helpText}>
          <p style={styles.helpTitle}>💡 ヒント</p>
          <p style={styles.helpContent}>
            家族の代表者が先にグループを作成し、その後他のメンバーが招待IDを使って参加します。
          </p>
        </div>
      </div>
    </div>
  );
};

// スタイル定義
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px',
    textAlign: 'center',
  } as React.CSSProperties,
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textAlign: 'left',
  } as React.CSSProperties,
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'white',
    color: '#333',
    border: '2px solid #007bff',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textAlign: 'left',
  } as React.CSSProperties,
  buttonIcon: {
    fontSize: '32px',
    marginRight: '16px',
    minWidth: '40px',
    textAlign: 'center',
  } as React.CSSProperties,
  buttonText: {
    flex: 1,
  } as React.CSSProperties,
  buttonTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
  } as React.CSSProperties,
  buttonDescription: {
    fontSize: '13px',
    opacity: 0.9,
  } as React.CSSProperties,
  helpText: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e9ecef',
  } as React.CSSProperties,
  helpTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  helpContent: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0',
  } as React.CSSProperties,
};

export default GroupSetupPage;
