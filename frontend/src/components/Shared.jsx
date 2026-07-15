import React from 'react';

export const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>💪 Health Rewards</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/steps">Steps</a></li>
              <li><a href="/rewards">Rewards</a></li>
              <li><a href="/leaderboard">Leaderboard</a></li>
              {user?.role === 'admin' && <li><a href="/admin">Admin</a></li>}
              <li><a href="/profile">Profile</a></li>
              <li><button onClick={onLogout} className="btn-logout">Logout</button></li>
            </ul>
          </nav>
        </div>
      </div>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo h1 {
          margin: 0;
          font-size: 28px;
        }

        .nav ul {
          display: flex;
          list-style: none;
          gap: 30px;
          align-items: center;
        }

        .nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.3s;
        }

        .nav a:hover {
          opacity: 0.8;
        }

        .btn-logout {
          background-color: white;
          color: #10b981;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-logout:hover {
          background-color: #f0f9ff;
        }

        @media (max-width: 768px) {
          .nav ul {
            gap: 15px;
            font-size: 14px;
          }
        }
      `}</style>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Health Reward Management System. All rights reserved.</p>
      </div>

      <style jsx>{`
        .footer {
          background-color: var(--dark-color);
          color: white;
          text-align: center;
          padding: 30px 0;
          margin-top: 60px;
        }

        .footer p {
          margin: 0;
        }
      `}</style>
    </footer>
  );
};

export const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>

      <style jsx>{`
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 15px;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .stat-primary .stat-icon {
          background-color: #d1fae5;
          color: #10b981;
        }

        .stat-secondary .stat-icon {
          background-color: #dbeafe;
          color: #3b82f6;
        }

        .stat-warning .stat-icon {
          background-color: #fef3c7;
          color: #f59e0b;
        }

        .stat-danger .stat-icon {
          background-color: #fee2e2;
          color: #ef4444;
        }

        .stat-title {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
        }

        .stat-value {
          margin: 5px 0 0 0;
          font-size: 24px;
          font-weight: bold;
          color: var(--dark-color);
        }
      `}</style>
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="spinner">
      <style jsx>{`
        .spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
        }

        .spinner::after {
          content: '';
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
