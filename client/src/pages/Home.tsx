import React, { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import { Post, PaginatedResponse } from '../types';

const TAGS = ['全部', '蔚县剪纸', '陕北剪纸', '扬州剪纸', '佛山剪纸', '满族剪纸', '剪纸刻纸', '染色剪纸', '套色剪纸', '单色剪纸'];

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [activeTag, setActiveTag] = useState('全部');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    postsAPI.getHotPosts().then((res) => setHotPosts(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: 12 };
    if (activeTag !== '全部') params.tag = activeTag;
    postsAPI.getPosts(params)
      .then((res) => {
        const data = res.data as PaginatedResponse<Post>;
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(page * 12 < data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeTag]);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    setPage(1);
    setPosts([]);
  };

  return (
    <div className="jz-home">
      <div className="jz-banner">
        <h1 className="jz-banner-title">匠心传承，纸间生花</h1>
        <p className="jz-banner-sub">连接每一位剪纸手艺人，让传统技艺薪火相传</p>
      </div>

      <div className="jz-home-content">
        <div className="jz-home-main">
          <div className="jz-tag-bar">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`jz-tag-btn ${activeTag === tag ? 'jz-tag-btn-active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="jz-post-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {loading && <div className="jz-loading">加载中...</div>}

          {hasMore && !loading && (
            <div className="jz-load-more">
              <button className="jz-btn jz-btn-outline" onClick={() => setPage(page + 1)}>
                加载更多
              </button>
            </div>
          )}
        </div>

        <div className="jz-home-sidebar">
          <div className="jz-sidebar-card">
            <h3 className="jz-sidebar-title">🔥 热门排行</h3>
            <ul className="jz-hot-list">
              {hotPosts.slice(0, 5).map((post, idx) => (
                <li key={post._id} className="jz-hot-item">
                  <span className={`jz-hot-rank jz-hot-rank-${idx + 1}`}>{idx + 1}</span>
                  <a href={`/post/${post._id}`} className="jz-hot-link">{post.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
