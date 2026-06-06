import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI, likesAPI, bookmarksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/CommentSection';
import { Post } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [pendingInvitations, setPendingInvitations] = useState<Post[]>([]);

  useEffect(() => {
    if (id) {
      postsAPI.getPost(id).then((res) => {
        setPost(res.data);
        setLikeCount(res.data.likeCount);
      }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      postsAPI.getMyInvitations().then((res) => {
        setPendingInvitations(res.data);
      }).catch(() => {});
    }
  }, [user]);

  const handleLike = async () => {
    if (!user || !id) return;
    try {
      const res = await likesAPI.toggleLike(id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {}
  };

  const handleBookmark = async () => {
    if (!user || !id) return;
    try {
      const res = await bookmarksAPI.toggleBookmark(id);
      setBookmarked(res.data.bookmarked);
    } catch {}
  };

  const handleConfirmCoAuthor = async (postId: string) => {
    try {
      await postsAPI.confirmCoAuthor(postId);
      setPendingInvitations((prev) => prev.filter((p) => p._id !== postId));
      if (id === postId) {
        postsAPI.getPost(id).then((res) => {
          setPost(res.data);
        });
      }
    } catch {}
  };

  if (!post) return <div className="jz-loading">加载中...</div>;

  const confirmedCoAuthors = post.coAuthors?.filter((co) => co.confirmed) || [];
  const allAuthors = [post.author, ...confirmedCoAuthors.map((co) => co.userId)];

  const hasPendingInvitation = user && pendingInvitations.some((p) => p._id === id);

  return (
    <div className="jz-post-detail">
      {pendingInvitations.length > 0 && (
        <div style={{ maxWidth: '800px', margin: '0 auto 20px', padding: '0 20px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>📩 共同作者邀请</h3>
          {pendingInvitations.map((inv) => (
            <div key={inv._id} className="jz-invitation-item">
              <div className="jz-invitation-info">
                <div className="jz-invitation-title">
                  《{inv.title}》邀请您成为共同作者
                </div>
                <div className="jz-invitation-desc">
                  由 {inv.author.username} 邀请
                </div>
              </div>
              <div className="jz-invitation-actions">
                <button
                  className="jz-btn jz-btn-primary"
                  onClick={() => handleConfirmCoAuthor(inv._id)}
                >
                  确认
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="jz-post-detail-main">
        <h1 className="jz-post-detail-title">{post.title}</h1>
        <div className="jz-post-detail-authors">
          {allAuthors.map((author, idx) => (
            <React.Fragment key={author._id}>
              <span className="jz-coauthor-badge">
                {author.avatar && (
                  <img src={author.avatar} alt="" className="jz-coauthor-avatar" />
                )}
                <Link to={`/profile/${author._id}`} style={{ color: 'inherit' }}>
                  {author.username}
                </Link>
                {idx === 0 && <span style={{ color: '#999' }}> (作者)</span>}
              </span>
              {idx < allAuthors.length - 1 && <span style={{ color: '#999' }}>·</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="jz-post-detail-author">
          <span className="jz-post-detail-role">
            {post.author.role === 'artisan' ? '手艺人' : post.author.role === 'learner' ? '学习者' : '爱好者'}
          </span>
          <span className="jz-post-detail-time">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {hasPendingInvitation && (
          <div style={{ background: '#fff8e1', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            <span style={{ marginRight: '12px' }}>📩 您被邀请成为该作品的共同作者</span>
            <button className="jz-btn jz-btn-primary jz-btn-small" onClick={() => handleConfirmCoAuthor(id!)}>
              确认加入
            </button>
          </div>
        )}

        {post.collection && (
          <div style={{ background: '#f5f0ff', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            <span style={{ marginRight: '8px' }}>📚 合辑：</span>
            <Link to={`/collections/${post.collection._id}`} style={{ color: '#6B5B95', fontWeight: '500' }}>
              {post.collection.title}
            </Link>
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className="jz-post-detail-images">
            {post.images.map((img, i) => (
              <img key={i} src={img} alt="" className="jz-post-detail-img" />
            ))}
          </div>
        )}

        <div className="jz-post-detail-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="jz-tag">{tag}</span>
          ))}
          {confirmedCoAuthors.length > 0 && (
            <span className="jz-tag jz-tag-coauthor">👥 联合创作</span>
          )}
          {post.postType === 'apprentice' && (
            <span className="jz-tag jz-tag-type">收徒</span>
          )}
          {post.postType === 'seeker' && (
            <span className="jz-tag jz-tag-seeker">求师</span>
          )}
          {post.teachingMode && (
            <span className="jz-tag">
              {post.teachingMode === 'online' ? '线上' : post.teachingMode === 'offline' ? '线下' : '线上+线下'}
            </span>
          )}
          {post.style && <span className="jz-tag">{post.style}</span>}
        </div>

        <div className="jz-post-detail-content">{post.content}</div>

        <div className="jz-post-detail-actions">
          <button className={`jz-action-btn ${liked ? 'jz-action-btn-active' : ''}`} onClick={handleLike}>
            ❤ {likeCount}
          </button>
          <button className={`jz-action-btn ${bookmarked ? 'jz-action-btn-active' : ''}`} onClick={handleBookmark}>
            {bookmarked ? '★' : '☆'} 收藏
          </button>
        </div>

        {id && <CommentSection postId={id} />}
      </div>
    </div>
  );
};

export default PostDetail;
