import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collectionsAPI, postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { Collection, Post } from '../types';

const CollectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', cover: '' });
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (id) {
      loadCollectionDetail();
    } else {
      loadCollections();
    }
  }, [id, activeTab]);

  const loadCollectionDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await collectionsAPI.getCollectionWithPosts(id, { page, limit: 12 });
      const data = res.data;
      setCollection(data.collection);
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(page * 12 < data.total);
    } catch {}
    setLoading(false);
  };

  const loadCollections = async () => {
    setLoading(true);
    try {
      if (activeTab === 'mine' && user) {
        const res = await collectionsAPI.getMyCollections();
        setMyCollections(res.data);
      } else {
        const res = await collectionsAPI.getCollections({ limit: 50 });
        setAllCollections(res.data.collections);
      }
    } catch {}
    setLoading(false);
  };

  const loadMyCollections = async () => {
    if (!user) return;
    try {
      const res = await collectionsAPI.getMyCollections();
      setMyCollections(res.data);
    } catch {}
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await collectionsAPI.createCollection(newCollection);
      setShowCreateModal(false);
      setNewCollection({ title: '', description: '', cover: '' });
      loadCollections();
    } catch {}
  };

  const handleAddToCollection = async (collectionId: string, postId: string) => {
    try {
      await collectionsAPI.addPostToCollection(collectionId, postId);
      setShowAddModal(false);
      if (id === collectionId) {
        loadCollectionDetail();
      }
    } catch {}
  };

  useEffect(() => {
    if (page > 1 && id) {
      loadCollectionDetail();
    }
  }, [page]);

  if (id) {
    if (!collection && !loading) return <div className="jz-loading">加载中...</div>;

    return (
      <div className="jz-collection-page">
        {collection && (
          <div className="jz-collection-header">
            <div className="jz-collection-header-cover">
              {collection.cover ? (
                <img src={collection.cover} alt={collection.title} />
              ) : (
                '📚'
              )}
            </div>
            <div className="jz-collection-header-info">
              <h1 className="jz-collection-header-title">{collection.title}</h1>
              <p className="jz-collection-header-desc">
                {collection.description || '暂无简介'}
              </p>
              <div className="jz-collection-header-meta">
                <span>作者：{collection.owner?.username}</span>
                <span>📝 {collection.postCount || 0} 个作品</span>
                <span>创建于 {new Date(collection.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="jz-post-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {loading && <div className="jz-loading">加载中...</div>}

        {hasMore && !loading && (
          <div className="jz-load-more">
            <button
              className="jz-btn jz-btn-outline"
              onClick={() => setPage(page + 1)}
            >
              加载更多
            </button>
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="jz-empty-state">
            <p>该合辑暂无作品</p>
          </div>
        )}
      </div>
    );
  }

  const displayCollections = activeTab === 'mine' ? myCollections : allCollections;

  return (
    <div className="jz-collection-page">
      <div className="jz-banner">
        <h1 className="jz-banner-title">作品合辑</h1>
        <p className="jz-banner-sub">发现精彩的剪纸作品系列</p>
      </div>

      <div className="jz-home-content">
        <div className="jz-home-main">
          <div className="jz-profile-tabs" style={{ marginBottom: '20px' }}>
            <button
              className={`jz-tab-btn ${activeTab === 'all' ? 'jz-tab-btn-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              全部合辑
            </button>
            {user && (
              <button
                className={`jz-tab-btn ${activeTab === 'mine' ? 'jz-tab-btn-active' : ''}`}
                onClick={() => {
                  setActiveTab('mine');
                  loadMyCollections();
                }}
              >
                我的合辑
              </button>
            )}
            {user && (
              <button
                className="jz-btn jz-btn-primary"
                style={{ marginLeft: 'auto' }}
                onClick={() => setShowCreateModal(true)}
              >
                + 创建合辑
              </button>
            )}
          </div>

          <div className="jz-collections-grid">
            {displayCollections.map((col) => (
              <Link
                key={col._id}
                to={`/collections/${col._id}`}
                className="jz-collection-card"
              >
                <div className="jz-collection-cover">
                  {col.cover ? <img src={col.cover} alt={col.title} /> : '📚'}
                </div>
                <div className="jz-collection-body">
                  <h3 className="jz-collection-title">{col.title}</h3>
                  <p className="jz-collection-desc">
                    {col.description || '暂无简介'}
                  </p>
                  <div className="jz-collection-meta">
                    <span>{col.owner?.username}</span>
                    <span>📝 {col.postCount || 0} 作品</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {loading && <div className="jz-loading">加载中...</div>}

          {displayCollections.length === 0 && !loading && (
            <div className="jz-empty-state">
              <p>暂无合辑</p>
              {user && activeTab === 'mine' && (
                <button
                  className="jz-btn jz-btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  创建第一个合辑
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="jz-modal-overlay" onClick={() => setShowCreateModal(false)}>
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
                  onClick={() => setShowCreateModal(false)}
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

export default CollectionPage;
