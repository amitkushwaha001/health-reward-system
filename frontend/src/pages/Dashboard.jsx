import React, { useState, useEffect } from 'react';
import { stepService, authService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { StatCard, LoadingSpinner } from '../components/Shared';

export const Dashboard = () => {
  const { updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSteps, setRecentSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, stepsRes] = await Promise.all([
        authService.getProfile(),
        stepService.getHistory({ limit: 7 }),
      ]);

      setStats(profileRes.data.data);
      updateUser(profileRes.data.data);
      setRecentSteps(stepsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <div className="container">
        <h1>Welcome, {stats?.name}! 👋</h1>

        {/* Main Stats */}
        <div className="grid grid-4">
          <StatCard
            title="Total Steps"
            value={stats?.totalSteps?.toLocaleString() || 0}
            icon="👣"
            color="primary"
          />
          <StatCard
            title="Total Points"
            value={stats?.totalPoints || 0}
            icon="⭐"
            color="secondary"
          />
          <StatCard
            title="Available Points"
            value={stats?.availablePoints || 0}
            icon="💎"
            color="warning"
          />
          <StatCard
            title="Redeemed Points"
            value={stats?.redeemedPoints || 0}
            icon="✅"
            color="danger"
          />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <a href="/steps" className="action-btn">
              <span>📊</span>
              <span>Log Steps</span>
            </a>
            <a href="/rewards" className="action-btn">
              <span>🎁</span>
              <span>View Rewards</span>
            </a>
            <a href="/leaderboard" className="action-btn">
              <span>🏆</span>
              <span>Leaderboard</span>
            </a>
            <a href="/profile" className="action-btn">
              <span>👤</span>
              <span>Profile</span>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {recentSteps.length > 0 ? (
              recentSteps.map((step) => (
                <div key={step._id} className="activity-item">
                  <div className="activity-info">
                    <p className="activity-date">
                      {new Date(step.date).toLocaleDateString()}
                    </p>
                    <p className="activity-details">
                      {step.steps.toLocaleString()} steps | +{step.pointsEarned} points
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No step records yet. Start logging your steps!</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          padding: 40px 0;
        }

        .dashboard-container h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .quick-actions {
          margin-top: 40px;
        }

        .quick-actions h2 {
          margin-bottom: 20px;
          color: var(--dark-color);
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .action-btn {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--dark-color);
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
        }

        .action-btn:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .action-btn span:first-child {
          font-size: 32px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .activity-item {
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-date {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          margin: 0;
        }

        .activity-details {
          margin: 5px 0 0 0;
          font-weight: 500;
          color: var(--dark-color);
        }

        .no-data {
          text-align: center;
          color: #9ca3af;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};
