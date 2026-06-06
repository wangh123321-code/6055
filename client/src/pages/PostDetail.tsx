import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  useEffect(() => {
    if (id) {
      postsAPI.getPost(id).then((res) => {
        setPost(res.data);
        setLikeCount(res.data.likeCount);
      }).catch(() => {});
    }
  }, [id]);

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

  if (!post) return <div className="jz-loading">加载中...</div>;

  return (
    <div className="jz-post-detail">
      <div className="jz-post-detail-main">
        <h1 className="jz-post-detail-title">{post.title}</h1>
        <div className="jz-post-detail-author">
          <a href={`/profile/${post.author._id}`} className="jz-post-detail-author-name">
            {post.author.username}
          </a>
          <span className="jz-post-detail-role">
            {post.author.role === 'artisan' ? '手艺人' : post.author.role === 'learner' ? '学习者' : '爱好者'}
          </span>
          <span className="jz-post-detail-time">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

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
