import React from 'react';
import { Match } from '../types';
import { matchingAPI } from '../services/api';

interface MatchCardProps {
  match: Match;
  onFeedback: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onFeedback }) => {
  const other = match.artisan;
  const scorePercent = Math.round(match.score * 100);

  const handleFeedback = async (status: string) => {
    try {
      await matchingAPI.submitFeedback(match._id, { status });
      onFeedback();
    } catch {}
  };

  return (
    <div className="jz-match-card">
      <div className="jz-match-card-header">
        <div className="jz-match-card-avatar">{other.avatar ? <img src={other.avatar} alt="" /> : '👤'}</div>
        <div className="jz-match-card-info">
          <h3 className="jz-match-card-name">{other.username}</h3>
          <span className="jz-match-card-role">
            {other.role === 'artisan' ? '手艺人' : other.role === 'learner' ? '学习者' : '爱好者'}
          </span>
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
      <div className="jz-match-card-actions">
        <button className="jz-btn jz-btn-primary" onClick={() => handleFeedback('accepted')}>感兴趣</button>
        <button className="jz-btn jz-btn-outline" onClick={() => handleFeedback('rejected')}>不合适</button>
      </div>
    </div>
  );
};

export default MatchCard;
