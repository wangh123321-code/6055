import React, { useState, useEffect, useCallback } from 'react';
import { matchingAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import { Match as MatchType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Match: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const fetchMatches = useCallback(() => {
    setLoading(true);
    matchingAPI.getRecommendations()
      .then((res) => setMatches(res.data))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) fetchMatches();
  }, [user, fetchMatches]);

  const handleRunMatching = async () => {
    setRunning(true);
    try {
      await matchingAPI.runMatching();
      fetchMatches();
    } catch {}
    setRunning(false);
  };

  if (!user) {
    return (
      <div className="jz-match-page">
        <div className="jz-empty-state">
          <p>请先登录后查看师徒匹配推荐</p>
          <a href="/login" className="jz-btn jz-btn-primary">去登录</a>
        </div>
      </div>
    );
  }

  return (
    <div className="jz-match-page">
      <div className="jz-match-header">
        <h1 className="jz-match-title">师徒匹配推荐</h1>
        <p className="jz-match-desc">
          基于你的标签、位置和偏好，为你推荐最匹配的师徒伙伴
        </p>
        <button className="jz-btn jz-btn-primary" onClick={handleRunMatching} disabled={running}>
          {running ? '匹配中...' : '手动匹配'}
        </button>
      </div>

      {loading ? (
        <div className="jz-loading">加载中...</div>
      ) : matches.length > 0 ? (
        <div className="jz-match-list">
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} onFeedback={fetchMatches} />
          ))}
        </div>
      ) : (
        <div className="jz-empty-state">
          <p>每周一自动匹配，或点击手动匹配</p>
          <p className="jz-empty-hint">完善你的个人标签和资料，可以获得更精准的推荐</p>
        </div>
      )}
    </div>
  );
};

export default Match;
