import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  showAddToCollection?: boolean;
  onAddToCollection?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, showAddToCollection, onAddToCollection }) => {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  const confirmedCoAuthors = post.coAuthors?.filter((co) => co.confirmed) || [];

  const allAuthors = [
    post.author,
    ...confirmedCoAuthors.map((co) => co.userId),
  ];

  const authorDisplay = allAuthors.map((a) => a.username).join(' · ');

  return (
    <div className="jz-post-card-wrapper">
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
            {confirmedCoAuthors.length > 0 && (
              <span className="jz-tag jz-tag-coauthor">👥 联合创作</span>
            )}
          </div>
          <div className="jz-post-card-meta">
            <span className="jz-post-card-author">{authorDisplay}</span>
            <span className="jz-post-card-stat">❤ {post.likeCount}</span>
            <span className="jz-post-card-stat">💬 {post.commentCount}</span>
            <span className="jz-post-card-time">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </Link>
      {showAddToCollection && onAddToCollection && (
        <button
          className="jz-btn jz-btn-outline jz-btn-small jz-add-collection-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCollection(post._id);
          }}
        >
          添加到合辑
        </button>
      )}
    </div>
  );
};

export default PostCard;
