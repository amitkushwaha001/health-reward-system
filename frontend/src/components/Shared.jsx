import React from 'react';
import { Link } from 'react-router-dom';

export const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <Link to="/dashboard" className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">+</span>
            <span>health<span>rewards</span></span>
          </Link>
          <nav className="app-nav" aria-label="Main navigation">
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/steps">Steps</Link></li>
              <li><Link to="/rewards">Rewards</Link></li>
              <li><Link to="/redemption-history">History</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
              {user?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={onLogout} className="btn-logout">Log out</button></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Health Reward Management System. All rights reserved.</p>
        <p className="developer-credit">Develop By Amit Kushwaha</p>
      </div>
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
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="spinner" role="status" aria-label="Loading">
      <span className="loading" />
    </div>
  );
};
