import React, { useState, useEffect } from 'react';
import { rewardService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/Shared';

export const RewardsPage = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await rewardService.getRewards();
      setRewards(response.data.data);
    } catch (err) {
      setError('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    try {
      const response = await rewardService.redeem({ rewardId });
      setMessage(response.data.message);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem reward');
    }
  };

  if (loading) return <LoadingSpinner />;

  const canRedeem = (pointsRequired) => user?.availablePoints >= pointsRequired;

  return (
    <div className="rewards-container">
      <div className="container">
        <h1>🎁 Available Rewards</h1>
        <p className="subtitle">Your Available Points: <strong>{user?.availablePoints || 0}</strong></p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid grid-3">
          {rewards.map((reward) => (
            <div key={reward._id} className="reward-card">
              <div className="reward-icon">
                {reward.category === 'CASH' && '💰'}
                {reward.category === 'MOVIE_TICKET' && '🎬'}
                {reward.category === 'SHOPPING_VOUCHER' && '🛍️'}
                {reward.category === 'FOOD_COUPON' && '🍔'}
              </div>

              <h3>{reward.title}</h3>
              <p className="category">{reward.category.replace('_', ' ')}</p>
              <p className="description">{reward.description}</p>

              <div className="reward-value">
                <p className="value">
                  {reward.currency || '₹'}{reward.value}
                </p>
                <p className="points-cost">
                  {reward.pointsRequired} Points
                </p>
              </div>

              <button
                onClick={() => handleRedeem(reward._id)}
                disabled={!canRedeem(reward.pointsRequired)}
                className={`btn ${canRedeem(reward.pointsRequired) ? 'btn-primary' : 'btn-disabled'}`}
              >
                {canRedeem(reward.pointsRequired) ? 'Redeem Now' : 'Insufficient Points'}
              </button>

              {!canRedeem(reward.pointsRequired) && (
                <p className="need-points">
                  Need {reward.pointsRequired - (user?.availablePoints || 0)} more points
                </p>
              )}
            </div>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="no-rewards">
            <p>No rewards available at the moment. Please check back later!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .rewards-container {
          min-height: 100vh;
          padding: 40px 0;
        }

        .rewards-container h1 {
          margin-bottom: 10px;
          color: var(--dark-color);
        }

        .subtitle {
          color: var(--primary-color);
          font-size: 18px;
          margin-bottom: 30px;
        }

        .reward-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .reward-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .reward-icon {
          font-size: 48px;
          margin-bottom: 15px;
          text-align: center;
        }

        .reward-card h3 {
          margin: 0 0 10px 0;
          color: var(--dark-color);
          font-size: 18px;
        }

        .category {
          margin: 0 0 10px 0;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--primary-color);
          font-weight: 600;
        }

        .description {
          margin: 0 0 15px 0;
          color: #6b7280;
          font-size: 14px;
          flex-grow: 1;
        }

        .reward-value {
          background: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          margin-bottom: 15px;
        }

        .value {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color);
        }

        .points-cost {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .btn-disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        .need-points {
          margin-top: 10px;
          font-size: 12px;
          color: var(--danger-color);
          text-align: center;
        }

        .no-rewards {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export const RedemptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await rewardService.getHistory();
      setHistory(response.data.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="redemption-history">
      <div className="container">
        <h1>📋 Redemption History</h1>

        <div className="card">
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reward</th>
                  <th>Points Used</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Redeem Code</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((redemption) => (
                    <tr key={redemption._id}>
                      <td>{new Date(redemption.createdAt).toLocaleDateString()}</td>
                      <td>{redemption.rewardId?.title}</td>
                      <td>{redemption.pointsUsed}</td>
                      <td>₹{redemption.value}</td>
                      <td>
                        <span className={`status status-${redemption.status}`}>
                          {redemption.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <code>{redemption.redeemCode}</code>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No redemptions yet. Start redeeming rewards!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .redemption-history {
          min-height: 100vh;
          padding: 40px 0;
        }

        .redemption-history h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }

        .history-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .status {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-rejected {
          background: #fee2e2;
          color: #7f1d1d;
        }

        code {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }

        .no-data {
          text-align: center;
          color: #9ca3af;
          padding: 30px !important;
        }
      `}</style>
    </div>
  );
};
