import React, { useState, useEffect } from 'react';
import { stepService, authService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/Shared';

export const StepsPage = () => {
  const { updateUser } = useAuth();
  const [steps, setSteps] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      const response = await stepService.getHistory();
      setSteps(response.data.data);
    } catch (err) {
      setError('Failed to fetch steps');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.steps || formData.steps <= 0) {
      setError('Please enter valid step count');
      return;
    }

    try {
      if (editingId) {
        const response = await stepService.updateSteps(editingId, {
          steps: parseInt(formData.steps),
        });
        setMessage(response.data.message);
        setEditingId(null);
      } else {
        const response = await stepService.addSteps({
          date: formData.date,
          steps: parseInt(formData.steps),
        });
        setMessage(response.data.message);
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        steps: '',
      });

      // Refresh data
      const [stepsRes, profileRes] = await Promise.all([
        stepService.getHistory(),
        authService.getProfile(),
      ]);
      setSteps(stepsRes.data.data);
      updateUser(profileRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save steps');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await stepService.deleteSteps(id);
        setMessage('Step record deleted successfully');
        fetchSteps();
      } catch (err) {
        setError('Failed to delete record');
      }
    }
  };

  const handleEdit = (step) => {
    setEditingId(step._id);
    setFormData({
      date: new Date(step.date).toISOString().split('T')[0],
      steps: step.steps.toString(),
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="steps-container">
      <div className="container">
        <h1>📊 Step Management</h1>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid grid-2">
          {/* Form */}
          <div className="card">
            <div className="card-header">
              <h2>{editingId ? 'Edit Steps' : 'Log Your Steps'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={!!editingId}
                />
              </div>

              <div className="form-group">
                <label>Steps Count</label>
                <input
                  type="number"
                  name="steps"
                  value={formData.steps}
                  onChange={handleChange}
                  placeholder="Enter number of steps"
                  min="0"
                  required
                />
                <p className="hint">
                  💡 Every 100 steps = 1 reward point
                </p>
                {formData.steps && (
                  <p className="points-earned">
                    You will earn <strong>{Math.floor(formData.steps / 100)}</strong> points
                  </p>
                )}
              </div>

              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Steps' : 'Log Steps'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        steps: '',
                      });
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="stats-box">
            <div className="stat">
              <h3>Total Steps This Month</h3>
              <p>
                {steps
                  .filter((s) => {
                    const date = new Date(s.date);
                    const now = new Date();
                    return (
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((sum, s) => sum + s.steps, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="stat">
              <h3>Total Records</h3>
              <p>{steps.length}</p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">
            <h2>Step History</h2>
          </div>

          <div className="table-responsive">
            <table className="steps-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Steps</th>
                  <th>Points Earned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <tr key={step._id}>
                      <td>{new Date(step.date).toLocaleDateString()}</td>
                      <td>{step.steps.toLocaleString()}</td>
                      <td>
                        <span className="points-badge">+{step.pointsEarned}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(step)}
                          className="btn-icon edit"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(step._id)}
                          className="btn-icon delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No step records yet. Start logging your steps!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .steps-container {
          min-height: 100vh;
          padding: 40px 0;
        }

        .steps-container h1 {
          margin-bottom: 30px;
          color: var(--dark-color);
        }

        .hint {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
        }

        .points-earned {
          font-size: 14px;
          color: var(--primary-color);
          font-weight: 600;
          margin-top: 5px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .button-group .btn {
          flex: 1;
        }

        .stats-box {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .stat {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat h3 {
          margin: 0 0 10px 0;
          color: #6b7280;
          font-size: 14px;
          text-transform: uppercase;
        }

        .stat p {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          color: var(--primary-color);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .steps-table {
          width: 100%;
          border-collapse: collapse;
        }

        .steps-table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }

        .steps-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .points-badge {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
        }

        .btn-icon {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin: 0 5px;
          transition: transform 0.2s;
        }

        .btn-icon:hover {
          transform: scale(1.2);
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
