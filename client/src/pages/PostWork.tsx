import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

const PostWork: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    images: '',
    tags: '',
    style: '',
  });
  const [coAuthorInvites, setCoAuthorInvites] = useState<string[]>([]);
  const [coAuthorSearch, setCoAuthorSearch] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coAuthorSearch.length > 0) {
      const timer = setTimeout(async () => {
        try {
          const res = await usersAPI.getProfile('search');
          if (Array.isArray(res.data)) {
            const filtered = res.data.filter(
              (u: User) =>
                u.username.toLowerCase().includes(coAuthorSearch.toLowerCase()) &&
                u._id !== user?._id &&
                !coAuthorInvites.includes(u._id)
            );
            setUserSuggestions(filtered.slice(0, 5));
          }
        } catch {}
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setUserSuggestions([]);
    }
  }, [coAuthorSearch, user, coAuthorInvites]);

  if (!user) {
    return (
      <div className="jz-empty-state">
        <p>请先登录后发布作品</p>
        <a href="/login" className="jz-btn jz-btn-primary">去登录</a>
      </div>
    );
  }

  const handleAddCoAuthor = (u: User) => {
    setCoAuthorInvites([...coAuthorInvites, u._id]);
    setCoAuthorSearch('');
    setUserSuggestions([]);
  };

  const handleRemoveCoAuthor = (id: string) => {
    setCoAuthorInvites(coAuthorInvites.filter((i) => i !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postsAPI.createPost({
        title: form.title,
        content: form.content,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        postType: 'work',
        style: form.style,
        coAuthorInvites,
      });
      navigate('/');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="jz-post-form-page">
      <h1 className="jz-post-form-title">发布作品</h1>
      <div className="jz-post-form-layout">
        <form className="jz-post-form" onSubmit={handleSubmit}>
          <div className="jz-form-group">
            <label className="jz-label">标题</label>
            <input
              className="jz-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="给你的作品起个名字"
              required
            />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">内容</label>
            <textarea
              className="jz-input"
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="介绍一下这个作品的创作背景、灵感来源..."
              required
            />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">图片URL（逗号分隔）</label>
            <input
              className="jz-input"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">标签（逗号分隔）</label>
            <input
              className="jz-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="蔚县剪纸,染色剪纸"
            />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">流派风格</label>
            <input
              className="jz-input"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              placeholder="如：蔚县剪纸"
            />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">邀请共同作者</label>
            <div style={{ position: 'relative' }}>
              <input
                className="jz-input"
                value={coAuthorSearch}
                onChange={(e) => setCoAuthorSearch(e.target.value)}
                placeholder="搜索用户名邀请联合创作者..."
              />
              {userSuggestions.length > 0 && (
                <div className="jz-user-suggestions">
                  {userSuggestions.map((u) => (
                    <div
                      key={u._id}
                      className="jz-user-suggestion-item"
                      onClick={() => handleAddCoAuthor(u)}
                    >
                      <span className="jz-match-card-avatar" style={{ width: '28px', height: '28px', fontSize: '14px' }}>
                        {u.avatar ? <img src={u.avatar} alt="" /> : '👤'}
                      </span>
                      <span>{u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {coAuthorInvites.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {coAuthorInvites.map((id) => (
                  <span key={id} className="jz-coauthor-tag">
                    👤 {id.slice(0, 8)}...
                    <span
                      className="jz-coauthor-remove"
                      onClick={() => handleRemoveCoAuthor(id)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              提示：被邀请的用户需要确认后才会显示为共同作者
            </p>
          </div>
          <button
            className="jz-btn jz-btn-primary jz-btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? '发布中...' : '发布作品'}
          </button>
        </form>

        <div className="jz-post-preview">
          <h3 className="jz-preview-title">预览</h3>
          <div className="jz-preview-card">
            <h4>{form.title || '作品标题'}</h4>
            <p>{form.content || '作品介绍...'}</p>
            {form.images && (
              <div className="jz-preview-images">
                {form.images
                  .split(',')
                  .map((img, i) =>
                    img.trim() ? <img key={i} src={img.trim()} alt="" /> : null
                  )}
              </div>
            )}
            <div className="jz-preview-tags">
              {form.tags
                .split(',')
                .filter(Boolean)
                .map((tag, i) => (
                  <span key={i} className="jz-tag">
                    {tag.trim()}
                  </span>
                ))}
              {coAuthorInvites.length > 0 && (
                <span className="jz-tag jz-tag-coauthor">👥 联合创作</span>
              )}
            </div>
            {form.style && (
              <p className="jz-preview-meta">流派：{form.style}</p>
            )}
            {coAuthorInvites.length > 0 && (
              <p className="jz-preview-meta" style={{ color: '#6B5B95' }}>
                已邀请 {coAuthorInvites.length} 位共同作者
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostWork;
