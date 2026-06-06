import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  return (
    <Link to={`/post/${post._id}`} className="jz-post-card">
      {post.images && post.images.length > 0 && (
        <div className="jz-post-card-cover">
          <img src={post.images[0]} alt={post.title} />
        </div>
      )}
      <div className="jz-post-card-body">
        <h3 className="jz-post-card-title">{post.title}</h3>
        <div className="jz-post-card-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="jz-tag">{tag}</span>
          ))}
        </div>
        <div className="jz-post-card-meta">
          <span className="jz-post-card-author">{post.author.username}</span>
          <span className="jz-post-card-stat">❤ {post.likeCount}</span>
          <span className="jz-post-card-stat">💬 {post.commentCount}</span>
          <span className="jz-post-card-time">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
