import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, postsAPI, bookmarksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { User, Post } from '../types';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', location: '', lng: '', lat: '', tags: '' });

  const isSelf = currentUser?._id === id;

  useEffect(() => {
    if (id) {
      usersAPI.getProfile(id).then((res) => {
        setProfile(res.data);
        setEditForm({
          bio: res.data.bio || '',
          location: '',
          lng: res.data.location?.coordinates?.[0]?.toString() || '',
          lat: res.data.location?.coordinates?.[1]?.toString() || '',
          tags: (res.data.tags || []).join(','),
        });
      }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      postsAPI.getPosts({ author: id, limit: 50 }).then((res) => setPosts(res.data)).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (isSelf && activeTab === 'bookmarks') {
      bookmarksAPI.getMyBookmarks().then((res) => setBookmarks(res.data)).catch(() => {});
    }
  }, [isSelf, activeTab]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      const lng = parseFloat(editForm.lng) || 0;
      const lat = parseFloat(editForm.lat) || 0;
      await usersAPI.updateProfile(currentUser._id, {
        bio: editForm.bio,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setEditing(false);
      if (id) usersAPI.getProfile(id).then((res) => setProfile(res.data));
    } catch {}
  };

  if (!profile) return <div className="jz-loading">加载中...</div>;

  return (
    <div className="jz-profile-page">
      <div className="jz-profile-header">
        <div className="jz-profile-avatar">
          {profile.avatar ? <img src={profile.avatar} alt="" /> : '👤'}
        </div>
        <div className="jz-profile-info">
          <h1 className="jz-profile-name">{profile.username}</h1>
          <span className="jz-profile-role">
            {profile.role === 'artisan' ? '手艺人' : profile.role === 'learner' ? '学习者' : '爱好者'}
          </span>
          <p className="jz-profile-bio">{profile.bio || '这个人很懒，还没有简介'}</p>
          {profile.location?.coordinates?.[0] && profile.location.coordinates[0] !== 0 && (
            <p className="jz-profile-location">
              📍 经度 {profile.location.coordinates[0].toFixed(4)}, 纬度 {profile.location.coordinates[1].toFixed(4)}
            </p>
          )}
          <div className="jz-profile-tags">
            {profile.tags.map((tag) => (
              <span key={tag} className="jz-tag">{tag}</span>
            ))}
          </div>
        </div>
        {isSelf && !editing && (
          <button className="jz-btn jz-btn-outline" onClick={() => setEditing(true)}>编辑资料</button>
        )}
      </div>

      {editing && (
        <div className="jz-profile-edit">
          <div className="jz-form-group">
            <label className="jz-label">简介</label>
            <textarea className="jz-input" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">经度</label>
            <input className="jz-input" value={editForm.lng} onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })} />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">纬度</label>
            <input className="jz-input" value={editForm.lat} onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })} />
          </div>
          <div className="jz-form-group">
            <label className="jz-label">标签（逗号分隔）</label>
            <input className="jz-input" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
          </div>
          <div className="jz-profile-edit-actions">
            <button className="jz-btn jz-btn-primary" onClick={handleSaveProfile}>保存</button>
            <button className="jz-btn jz-btn-outline" onClick={() => setEditing(false)}>取消</button>
          </div>
        </div>
      )}

      <div className="jz-profile-tabs">
        <button
          className={`jz-tab-btn ${activeTab === 'posts' ? 'jz-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          作品集
        </button>
        {isSelf && (
          <button
            className={`jz-tab-btn ${activeTab === 'bookmarks' ? 'jz-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            收藏
          </button>
        )}
      </div>

      <div className="jz-post-grid">
        {(activeTab === 'posts' ? posts : bookmarks).map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
