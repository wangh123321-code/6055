import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostSeeker: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="jz-empty-state">
        <p>请先登录后发布求师帖</p>
        <a href="/login" className="jz-btn jz-btn-primary">去登录</a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postsAPI.createPost({
        title: form.title,
        content: form.content,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        postType: 'seeker',
      });
      navigate('/');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="jz-post-form-page">
      <h1 className="jz-post-form-title">发布求师帖</h1>
      <div className="jz-post-form-layout">
        <form className="jz-post-form" onSubmit={handleSubmit}>
          <div className="jz-form-group">
            <label className="jz-label">标题</label>
            <input className="jz-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">内容</label>
            <textarea className="jz-input" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="描述你想学习的方向、基础情况、期望的学习方式等..." required />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">想学的流派标签（逗号分隔）</label>
            <input className="jz-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="蔚县剪纸,染色剪纸" />
          </div>
          <button className="jz-btn jz-btn-primary jz-btn-block" type="submit" disabled={loading}>
            {loading ? '发布中...' : '发布求师帖'}
          </button>
        </form>

        <div className="jz-post-preview">
          <h3 className="jz-preview-title">预览</h3>
          <div className="jz-preview-card">
            <h4>{form.title || '帖子标题'}</h4>
            <p>{form.content || '帖子内容...'}</p>
            <div className="jz-preview-tags">
              {form.tags.split(',').filter(Boolean).map((tag, i) => (
                <span key={i} className="jz-tag">{tag.trim()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSeeker;
