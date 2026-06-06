import React from 'react';
import { Match } from '../types';
import { matchingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface MatchCardProps {
  match: Match;
  onFeedback: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onFeedback }) => {
  const { user } = useAuth();
  const other = user?._id === match.artisan._id ? match.learner : match.artisan;
  const scorePercent = Math.round(match.score * 100);

  const handleFeedback = async (status: 'interested' | 'not_suitable') => {
    try {
      await matchingAPI.submitFeedback(match._id, { status });
      onFeedback();
    } catch {}
  };

  const roleLabel = (role: string) => {
    return role === 'artisan' ? '手艺人' : role === 'learner' ? '学习者' : '爱好者';
  };

  return (
    <div className="jz-match-card">
      <div className="jz-match-card-header">
        <div className="jz-match-card-avatar">{other.avatar ? <img src={other.avatar} alt="" /> : '👤'}</div>
        <div className="jz-match-card-info">
          <h3 className="jz-match-card-name">{other.username}</h3>
          <span className="jz-match-card-role">{roleLabel(other.role)}</span>
        </div>
      </div>
      <div className="jz-match-card-tags">
        {other.tags.map((tag) => (
          <span key={tag} className="jz-tag">{tag}</span>
        ))}
      </div>
      <div className="jz-match-card-score">
        <span className="jz-match-score-label">匹配度</span>
        <div className="jz-match-score-bar">
          <div className="jz-match-score-fill" style={{ width: `${scorePercent}%` }} />
        </div>
        <span className="jz-match-score-value">{scorePercent}%</span>
      </div>
      {match.status === 'pending' && (
        <div className="jz-match-card-actions">
          <button className="jz-btn jz-btn-primary" onClick={() => handleFeedback('interested')}>感兴趣</button>
          <button className="jz-btn jz-btn-outline" onClick={() => handleFeedback('not_suitable')}>不合适</button>
        </div>
      )}
      {match.status === 'interested' && (
        <div style={{ textAlign: 'center', color: '#D4A84B', fontWeight: 600, padding: '8px 0' }}>
          ✓ 已标记感兴趣
        </div>
      )}
      {match.status === 'not_suitable' && (
        <div style={{ textAlign: 'center', color: '#999', padding: '8px 0' }}>
          ✗ 已标记不合适
        </div>
      )}
    </div>
  );
};

export default MatchCard;
