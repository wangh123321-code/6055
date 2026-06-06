import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
  { value: 'artisan', label: '手艺人', icon: '✂️', desc: '我有剪纸技艺，愿意传授' },
  { value: 'learner', label: '学习者', icon: '📖', desc: '我想学习剪纸技艺' },
  { value: 'enthusiast', label: '爱好者', icon: '❤️', desc: '我热爱剪纸文化' },
];

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('请选择角色');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(username, password, role);
      navigate('/');
    } catch {
      setError('注册失败，用户名可能已存在');
    }
    setLoading(false);
  };

  return (
    <div className="jz-auth-page">
      <div className="jz-auth-card jz-auth-card-wide">
        <h2 className="jz-auth-title">加入剪纸社区</h2>
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
          <div className="jz-form-group">
            <label className="jz-label">选择角色</label>
            <div className="jz-role-cards">
              {ROLES.map((r) => (
                <div
                  key={r.value}
                  className={`jz-role-card ${role === r.value ? 'jz-role-card-active' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <div className="jz-role-icon">{r.icon}</div>
                  <div className="jz-role-label">{r.label}</div>
                  <div className="jz-role-desc">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="jz-btn jz-btn-primary jz-btn-block" type="submit" disabled={loading}>
            注册
          </button>
        </form>
        <div className="jz-auth-footer">
          已有账号？<a href="/login">去登录</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
