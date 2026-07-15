import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/apiService';
import { StatCard } from '../components/Shared';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await userService.updateProfile(formData);
      setProfile(response.data.data);
      updateUser(response.data.data);
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await userService.changePassword(passwordForm);
      setMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="container">
        <h1>My Profile</h1>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid grid-2">
          {/* Profile Stats */}
          <div>
            <div className="card">
              <div className="card-header">
                <h2>Profile Information</h2>
              </div>

              {!editing ? (
                <div className="profile-info">
                  <div className="info-group">
                    <label>Name</label>
                    <p>{profile?.name}</p>
                  </div>
                  <div className="info-group">
                    <label>Email</label>
                    <p>{profile?.email}</p>
                  </div>
                  <div className="info-group">
                    <label>Role</label>
                    <p>{profile?.role === 'admin' ? '👨‍💼 Admin' : '👤 User'}</p>
                  </div>
                  <div className="info-group">
                    <label>Member Since</label>
                    <p>{new Date(profile?.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={updateProfile}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="button-group">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="stats-grid">
              <StatCard
                title="Total Steps"
                value={profile?.totalSteps?.toLocaleString() || 0}
                icon="👣"
                color="primary"
              />
              <StatCard
                title="Total Points"
                value={profile?.totalPoints || 0}
                icon="⭐"
                color="secondary"
              />
              <StatCard
                title="Available Points"
                value={profile?.availablePoints || 0}
                icon="💎"
                color="warning"
              />
              <StatCard
                title="Redeemed Points"
                value={profile?.redeemedPoints || 0}
                icon="✅"
                color="success"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">
            <h2>Change Password</h2>
          </div>
          <form onSubmit={changePassword} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          padding: 40px 0;
        }

        .profile-container h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-group {
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-group label {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .info-group p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          gap: 15px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .button-group .btn {
          flex: 1;
        }

        .password-form {
          max-width: 500px;
        }
      `}</style>
    </div>
  );
};
