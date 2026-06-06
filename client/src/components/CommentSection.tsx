import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    commentsAPI.getComments(postId).then((res) => setComments(res.data)).catch(() => {});
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await commentsAPI.createComment(postId, { content: content.trim() });
      setComments([...comments, res.data]);
      setContent('');
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentsAPI.deleteComment(postId, commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch {}
  };

  return (
    <div className="jz-comment-section">
      <h3 className="jz-comment-title">评论 ({comments.length})</h3>
      {user && (
        <form className="jz-comment-form" onSubmit={handleSubmit}>
          <textarea
            className="jz-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
          />
          <button className="jz-btn jz-btn-primary" type="submit" disabled={loading}>
            发表评论
          </button>
        </form>
      )}
      <div className="jz-comment-list">
        {comments.map((comment) => (
          <div key={comment._id} className="jz-comment-item">
            <div className="jz-comment-header">
              <span className="jz-comment-author">{comment.author.username}</span>
              <span className="jz-comment-time">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {user && user._id === comment.author._id && (
                <button className="jz-comment-delete" onClick={() => handleDelete(comment._id)}>
                  删除
                </button>
              )}
            </div>
            <p className="jz-comment-content">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
