import React, { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';
import { LoadingSpinner, StatCard } from '../components/Shared';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboard();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>📊 Admin Dashboard</h1>

        <div className="grid grid-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="👥"
            color="primary"
          />
          <StatCard
            title="Total Steps"
            value={stats?.totalSteps?.toLocaleString() || 0}
            icon="👣"
            color="secondary"
          />
          <StatCard
            title="Rewards Generated"
            value={stats?.totalRewardsGenerated || 0}
            icon="⭐"
            color="warning"
          />
          <StatCard
            title="Total Redemptions"
            value={stats?.totalRedemptions || 0}
            icon="✅"
            color="danger"
          />
        </div>

        {/* Admin Actions */}
        <div className="admin-actions" style={{ marginTop: '40px' }}>
          <h2>Admin Actions</h2>
          <div className="action-buttons">
            <a href="/admin/users" className="action-btn">
              <span>👥</span>
              <span>Manage Users</span>
            </a>
            <a href="/admin/rewards" className="action-btn">
              <span>🎁</span>
              <span>Manage Rewards</span>
            </a>
            <a href="/admin/reports" className="action-btn">
              <span>📈</span>
              <span>View Reports</span>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          padding: 40px 0;
        }

        .admin-dashboard h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .admin-actions h2 {
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
        }

        .action-btn:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .action-btn span:first-child {
          font-size: 32px;
        }
      `}</style>
    </div>
  );
};

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getUsers({ search });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
      await adminService.blockUser(id);
      setMessage('User status updated');
      fetchUsers();
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await adminService.deleteUser(id);
        setMessage('User deleted successfully');
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-users">
      <div className="container">
        <h1>👥 Manage Users</h1>

        {message && <div className="alert alert-success">{message}</div>}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={fetchUsers} className="btn btn-primary">
            Search
          </button>
        </div>

        <div className="card">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Steps</th>
                  <th>Total Points</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.totalSteps.toLocaleString()}</td>
                    <td>{user.totalPoints}</td>
                    <td>
                      <span className={`status ${user.isBlocked ? 'blocked' : 'active'}`}>
                        {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleBlock(user._id)}
                        className="btn-action"
                        title={user.isBlocked ? 'Unblock' : 'Block'}
                      >
                        {user.isBlocked ? '🔓' : '🔒'}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn-action danger"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-users {
          min-height: 100vh;
          padding: 40px 0;
        }

        .admin-users h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .search-box input {
          flex: 1;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }

        .users-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .status {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status.blocked {
          background: #fee2e2;
          color: #7f1d1d;
        }

        .btn-action {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin: 0 5px;
        }

        .btn-action.danger:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export const AdminRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'CASH',
    pointsRequired: '',
    value: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await adminService.getRewards();
      setRewards(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateReward(editingId, formData);
        setMessage('Reward updated successfully');
      } else {
        await adminService.createReward(formData);
        setMessage('Reward created successfully');
      }
      setFormData({
        title: '',
        category: 'CASH',
        pointsRequired: '',
        value: '',
        description: '',
      });
      setEditingId(null);
      fetchRewards();
    } catch (err) {
      setMessage('Error saving reward');
    }
  };

  return (
    <div className="admin-rewards">
      <div className="container">
        <h1>🎁 Manage Rewards</h1>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h2>{editingId ? 'Edit Reward' : 'Create New Reward'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>CASH</option>
                  <option>MOVIE_TICKET</option>
                  <option>SHOPPING_VOUCHER</option>
                  <option>FOOD_COUPON</option>
                </select>
              </div>
              <div className="form-group">
                <label>Points Required</label>
                <input
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Value</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Reward' : 'Create Reward'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent Rewards</h2>
            </div>
            <div className="rewards-list">
              {rewards.length > 0 ? (
                rewards.map((reward) => (
                  <div key={reward._id} className="reward-item">
                    <h4>{reward.title}</h4>
                    <p>{reward.pointsRequired} points</p>
                  </div>
                ))
              ) : (
                <p>No rewards yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-rewards {
          min-height: 100vh;
          padding: 40px 0;
        }

        .admin-rewards h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .rewards-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reward-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .reward-item h4 {
          margin: 0;
          color: var(--dark-color);
        }

        .reward-item p {
          margin: 5px 0 0 0;
          font-size: 12px;
          color: var(--primary-color);
        }
      `}</style>
    </div>
  );
};

export const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await adminService.getReports();
      setReports(response.data.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-reports">
      <div className="container">
        <h1>📈 Reports</h1>

        {reports && (
          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <h2>User Activity</h2>
              </div>
              <div className="report-stats">
                <p>Total Users: <strong>{reports.userActivity.totalUsers}</strong></p>
                <p>Total Points: <strong>{reports.userActivity.totalPoints}</strong></p>
                <p>Total Redeemed: <strong>{reports.userActivity.totalRedeemed}</strong></p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Top Redemptions</h2>
              </div>
              <div className="report-list">
                {reports.redemptionHistory.map((item) => (
                  <div key={item._id} className="report-item">
                    <p>{item._id}</p>
                    <p><strong>{item.count}</strong> redemptions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-reports {
          min-height: 100vh;
          padding: 40px 0;
        }

        .admin-reports h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .report-stats {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .report-stats p {
          margin: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .report-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .report-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .report-item p {
          margin: 0;
        }

        .report-item p:first-child {
          text-transform: uppercase;
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }

        .report-item p:last-child {
          margin-top: 5px;
          color: var(--primary-color);
        }
      `}</style>
    </div>
  );
};
