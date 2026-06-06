import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI, bookmarksAPI, collectionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { User, Post, Collection } from '../types';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'collections' | 'bookmarks'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', location: '', lng: '', lat: '', tags: '' });
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', cover: '' });

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
      postsAPI.getPosts({ author: id, limit: 50 }).then((res) => setPosts(res.data.posts)).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'collections') {
      collectionsAPI.getCollections({ owner: id, limit: 50 }).then((res) => {
        setCollections(res.data.collections);
      }).catch(() => {});
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (isSelf && activeTab === 'bookmarks') {
      bookmarksAPI.getMyBookmarks().then((res) => setBookmarks(res.data)).catch(() => {});
    }
  }, [isSelf, activeTab]);

  useEffect(() => {
    if (isSelf && showAddToCollectionModal) {
      collectionsAPI.getMyCollections().then((res) => setMyCollections(res.data)).catch(() => {});
    }
  }, [isSelf, showAddToCollectionModal]);

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

  const handleAddToCollection = (postId: string) => {
    setSelectedPostId(postId);
    setShowAddToCollectionModal(true);
  };

  const handleConfirmAddToCollection = async (collectionId: string) => {
    if (!selectedPostId) return;
    try {
      await collectionsAPI.addPostToCollection(collectionId, selectedPostId);
      setShowAddToCollectionModal(false);
      setSelectedPostId(null);
    } catch {}
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await collectionsAPI.createCollection(newCollection);
      setShowCreateCollectionModal(false);
      setNewCollection({ title: '', description: '', cover: '' });
      if (id) {
        collectionsAPI.getCollections({ owner: id, limit: 50 }).then((res) => {
          setCollections(res.data.collections);
        });
      }
      if (isSelf) {
        collectionsAPI.getMyCollections().then((res) => setMyCollections(res.data));
      }
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
        <button
          className={`jz-tab-btn ${activeTab === 'collections' ? 'jz-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          合辑
        </button>
        {isSelf && (
          <button
            className={`jz-tab-btn ${activeTab === 'bookmarks' ? 'jz-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            收藏
          </button>
        )}
        {isSelf && (
          <button
            className="jz-btn jz-btn-primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => setShowCreateCollectionModal(true)}
          >
            + 创建合辑
          </button>
        )}
      </div>

      {activeTab === 'posts' && (
        <div className="jz-post-grid">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              showAddToCollection={isSelf}
              onAddToCollection={handleAddToCollection}
            />
          ))}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="jz-collections-grid">
          {collections.map((col) => (
            <Link key={col._id} to={`/collections/${col._id}`} className="jz-collection-card">
              <div className="jz-collection-cover">
                {col.cover ? <img src={col.cover} alt={col.title} /> : '📚'}
              </div>
              <div className="jz-collection-body">
                <h3 className="jz-collection-title">{col.title}</h3>
                <p className="jz-collection-desc">{col.description || '暂无简介'}</p>
                <div className="jz-collection-meta">
                  <span>📝 {col.postCount || 0} 作品</span>
                  <span>{new Date(col.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="jz-post-grid">
          {bookmarks.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {(activeTab === 'posts' && posts.length === 0) ||
      (activeTab === 'collections' && collections.length === 0) ||
      (activeTab === 'bookmarks' && bookmarks.length === 0) ? (
        <div className="jz-empty-state">
          <p>
            {activeTab === 'posts' && '暂无作品'}
            {activeTab === 'collections' && '暂无合辑'}
            {activeTab === 'bookmarks' && '暂无收藏'}
          </p>
          {isSelf && activeTab === 'collections' && (
            <button className="jz-btn jz-btn-primary" onClick={() => setShowCreateCollectionModal(true)}>
              创建第一个合辑
            </button>
          )}
        </div>
      ) : null}

      {showAddToCollectionModal && (
        <div className="jz-modal-overlay" onClick={() => setShowAddToCollectionModal(false)}>
          <div className="jz-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="jz-modal-title">添加到合辑</h3>
            {myCollections.length === 0 ? (
              <div className="jz-empty-state">
                <p>您还没有合辑</p>
                <button
                  className="jz-btn jz-btn-primary"
                  onClick={() => {
                    setShowAddToCollectionModal(false);
                    setShowCreateCollectionModal(true);
                  }}
                >
                  创建合辑
                </button>
              </div>
            ) : (
              myCollections.map((col) => (
                <div
                  key={col._id}
                  className="jz-collection-item"
                  onClick={() => handleConfirmAddToCollection(col._id)}
                >
                  <div className="jz-collection-item-title">{col.title}</div>
                  <div className="jz-collection-item-meta">
                    {col.postCount || 0} 个作品
                  </div>
                </div>
              ))
            )}
            <div className="jz-modal-actions">
              <button
                className="jz-btn jz-btn-outline"
                onClick={() => setShowAddToCollectionModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateCollectionModal && (
        <div className="jz-modal-overlay" onClick={() => setShowCreateCollectionModal(false)}>
          <div className="jz-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="jz-modal-title">创建合辑</h3>
            <form onSubmit={handleCreateCollection}>
              <div className="jz-form-group">
                <label className="jz-label">标题</label>
                <input
                  className="jz-input"
                  value={newCollection.title}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, title: e.target.value })
                  }
                  placeholder="如：2025春节窗花系列"
                  required
                />
              </div>
              <div className="jz-form-group">
                <label className="jz-label">简介</label>
                <textarea
                  className="jz-input"
                  rows={3}
                  value={newCollection.description}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, description: e.target.value })
                  }
                  placeholder="介绍一下这个合辑的内容..."
                />
              </div>
              <div className="jz-form-group">
                <label className="jz-label">封面图片URL</label>
                <input
                  className="jz-input"
                  value={newCollection.cover}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, cover: e.target.value })
                  }
                  placeholder="可选"
                />
              </div>
              <div className="jz-modal-actions">
                <button
                  type="button"
                  className="jz-btn jz-btn-outline"
                  onClick={() => setShowCreateCollectionModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="jz-btn jz-btn-primary">
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
