import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/apiService';
import { LoadingSpinner } from '../components/Shared';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const [leaderRes, rankRes] = await Promise.all([
        leaderboardService.getLeaderboard(),
        leaderboardService.getUserRank(),
      ]);
      setLeaderboard(leaderRes.data.data);
      setUserRank(rankRes.data.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="leaderboard-container">
      <div className="container">
        <h1>🏆 Leaderboard</h1>

        {/* Your Rank */}
        {userRank && (
          <div className="my-rank-card">
            <div className="rank-badge">#{userRank.rank}</div>
            <div className="rank-info">
              <h3>{userRank.name}</h3>
              <p>{userRank.totalSteps.toLocaleString()} Steps | {userRank.totalPoints} Points</p>
            </div>
          </div>
        )}

        {/* Top 10 */}
        <div className="card">
          <div className="card-header">
            <h2>Top 10 Users</h2>
          </div>

          <div className="leaderboard-list">
            {leaderboard.map((user, index) => (
              <div
                key={user.rank}
                className={`leaderboard-item ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}
              >
                <div className="rank-position">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && <span>#{user.rank}</span>}
                </div>

                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="steps">{user.totalSteps.toLocaleString()} steps</p>
                </div>

                <div className="points-display">
                  <p className="points">{user.totalPoints}</p>
                  <p className="label">Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .leaderboard-container {
          min-height: 100vh;
          padding: 40px 0;
        }

        .leaderboard-container h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .my-rank-card {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .rank-badge {
          font-size: 36px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.2);
          padding: 20px 24px;
          border-radius: 10px;
          min-width: 80px;
          text-align: center;
        }

        .rank-info {
          flex-grow: 1;
        }

        .rank-info h3 {
          margin: 0 0 5px 0;
          font-size: 20px;
        }

        .rank-info p {
          margin: 0;
          opacity: 0.9;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px;
          background: white;
          border-radius: 10px;
          border-left: 4px solid #e5e7eb;
          transition: all 0.3s;
        }

        .leaderboard-item:hover {
          border-left-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
          transform: translateX(5px);
        }

        .leaderboard-item.first {
          border-left-color: #fbbf24;
          background: #fffbeb;
        }

        .leaderboard-item.second {
          border-left-color: #d1d5db;
          background: #f9fafb;
        }

        .leaderboard-item.third {
          border-left-color: #ea580c;
          background: #fef3f2;
        }

        .rank-position {
          font-size: 24px;
          min-width: 50px;
          text-align: center;
          font-weight: bold;
          color: var(--dark-color);
        }

        .user-info {
          flex-grow: 1;
        }

        .user-info h3 {
          margin: 0 0 5px 0;
          color: var(--dark-color);
          font-size: 16px;
        }

        .steps {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .points-display {
          text-align: right;
          background: #f0fdf4;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #dcfce7;
        }

        .points {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
          color: var(--primary-color);
        }

        .label {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};
