import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostApprentice: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    images: '',
    tags: '',
    teachingMode: 'both' as string,
    style: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="jz-empty-state">
        <p>请先登录后发布收徒帖</p>
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
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        postType: 'apprentice',
        teachingMode: form.teachingMode,
        style: form.style,
      });
      navigate('/');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="jz-post-form-page">
      <h1 className="jz-post-form-title">发布收徒帖</h1>
      <div className="jz-post-form-layout">
        <form className="jz-post-form" onSubmit={handleSubmit}>
          <div className="jz-form-group">
            <label className="jz-label">标题</label>
            <input className="jz-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">内容</label>
            <textarea className="jz-input" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">图片URL（逗号分隔）</label>
            <input className="jz-input" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">标签（逗号分隔）</label>
            <input className="jz-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="蔚县剪纸,染色剪纸" />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">教学方式</label>
            <select className="jz-input" value={form.teachingMode} onChange={(e) => setForm({ ...form, teachingMode: e.target.value })}>
              <option value="online">线上</option>
              <option value="offline">线下</option>
              <option value="both">两者皆可</option>
            </select>
          </div>
          <div className="jz-form-group">
            <label className="jz-label">流派风格</label>
            <input className="jz-input" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} placeholder="如：蔚县剪纸" />
          </div>
          <button className="jz-btn jz-btn-primary jz-btn-block" type="submit" disabled={loading}>
            {loading ? '发布中...' : '发布收徒帖'}
          </button>
        </form>

        <div className="jz-post-preview">
          <h3 className="jz-preview-title">预览</h3>
          <div className="jz-preview-card">
            <h4>{form.title || '帖子标题'}</h4>
            <p>{form.content || '帖子内容...'}</p>
            {form.images && (
              <div className="jz-preview-images">
                {form.images.split(',').map((img, i) => img.trim() && <img key={i} src={img.trim()} alt="" />)}
              </div>
            )}
            <div className="jz-preview-tags">
              {form.tags.split(',').filter(Boolean).map((tag, i) => (
                <span key={i} className="jz-tag">{tag.trim()}</span>
              ))}
            </div>
            <p className="jz-preview-meta">
              教学方式：{form.teachingMode === 'online' ? '线上' : form.teachingMode === 'offline' ? '线下' : '两者皆可'}
              {form.style && ` | 流派：${form.style}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostApprentice;
