import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('登录失败，请检查用户名和密码');
    }
    setLoading(false);
  };

  return (
    <div className="jz-auth-page">
      <div className="jz-auth-card">
        <h2 className="jz-auth-title">登录剪纸社区</h2>
        {error && <div className="jz-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="jz-form-group">
            <label className="jz-label">用户名</label>
            <input
              className="jz-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">密码</label>
            <input
              className="jz-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="jz-btn jz-btn-primary jz-btn-block" type="submit" disabled={loading}>
            登录
          </button>
        </form>
        <div className="jz-auth-footer">
          还没有账号？<a href="/register">去注册</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
