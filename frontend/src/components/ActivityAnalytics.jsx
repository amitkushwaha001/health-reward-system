import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { analyticsService } from '../services/apiService';
import { getHeatmapCells, makePointsChartData, makeStepsChartData } from '../utils/analyticsPresentation';
import './registerCharts';
import './ActivityAnalytics.css';
import { formatRewardBalance } from '../utils/rewardCurrency';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: { legend: { position: 'bottom' } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 2 } },
  },
};

const Heatmap = ({ data }) => {
  const cells = getHeatmapCells(data);
  const maxSteps = Math.max(1, ...cells.map((cell) => cell.steps || 0));

  return (
    <div className="activity-heatmap" role="grid" aria-label={`Logged steps heatmap for ${data.month}`}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <span className="heatmap-weekday" key={day} role="columnheader">{day}</span>
      ))}
      {cells.map((cell) => {
        if (cell.empty) return <span className="heatmap-cell heatmap-offset" key={cell.key} aria-hidden="true" />;
        const level = cell.steps === null ? 0 : Math.min(4, Math.ceil((cell.steps / maxSteps) * 4));
        const label = cell.steps === null
          ? `${data.month}-${String(cell.day).padStart(2, '0')}: no step record`
          : `${data.month}-${String(cell.day).padStart(2, '0')}: ${cell.steps.toLocaleString()} steps`;
        return (
          <span
            className={`heatmap-cell heatmap-level-${level}${cell.steps === null ? ' heatmap-unlogged' : ''}`}
            key={cell.key}
            role="gridcell"
            aria-label={label}
            title={label}
          >
            {cell.day}
          </span>
        );
      })}
    </div>
  );
};

export const ActivityAnalytics = () => {
  const [range, setRange] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { range };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await analyticsService.getActivity(params);
        if (active) setAnalytics(response.data.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Analytics could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { active = false; };
  }, [range, startDate, endDate, reloadKey]);

  const heatmapCells = analytics?.heatmap?.days || [];
  const heatmapSteps = heatmapCells.filter((day) => day.steps !== null);

  return (
    <section className="analytics-section" aria-labelledby="analytics-title">
      <div className="analytics-heading">
        <div>
          <p className="section-eyebrow">YOUR ACTIVITY, AT A GLANCE</p>
          <h2 id="analytics-title">Progress analytics</h2>
        </div>
        <div className="analytics-filters">
          <label>
            <span>View by</span>
            <select value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            <span>From</span>
            <input aria-label="Analytics start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label>
            <span>To</span>
            <input aria-label="Analytics end date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        </div>
      </div>

      {error && (
        <div className="analytics-error" role="alert">
          <span>{error}</span>
          <button type="button" className="text-button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="analytics-loading" role="status" aria-live="polite">Loading your activity…</div>
      ) : analytics && (
        <>
          <div className="analytics-summary-grid">
            <article className="analytics-summary-card">
              <span className="analytics-summary-icon" aria-hidden="true">↗</span>
              <p>Steps logged</p>
              <strong>{analytics.totals.totalSteps.toLocaleString()}</strong>
              <small>{analytics.totals.loggedDays} recorded day{analytics.totals.loggedDays === 1 ? '' : 's'}</small>
            </article>
            <article className="analytics-summary-card">
              <span className="analytics-summary-icon" aria-hidden="true">✦</span>
              <p>Reward value earned</p>
              <strong>{formatRewardBalance(analytics.totals.totalPointsEarned)}</strong>
              <small>From recorded activity</small>
            </article>
            <article className="analytics-summary-card">
              <span className="analytics-summary-icon" aria-hidden="true">◷</span>
              <p>Est. active time</p>
              <strong>{analytics.estimates.activityMinutes === null ? '—' : `${analytics.estimates.activityMinutes} min`}</strong>
              <small>Approximation from steps</small>
            </article>
            <article className="analytics-summary-card">
              <span className="analytics-summary-icon" aria-hidden="true">≈</span>
              <p>Est. calories</p>
              <strong>{analytics.estimates.caloriesBurned === null ? '—' : `${analytics.estimates.caloriesBurned} kcal`}</strong>
              <small>Approximation from steps</small>
            </article>
          </div>

          <div className="analytics-chart-grid">
            <article className="analytics-card analytics-card-wide">
              <div className="analytics-card-heading">
                <div><h3>Step trends</h3><p>Only logged activity is plotted.</p></div>
                <span>{analytics.period.startDate} – {analytics.period.endDate}</span>
              </div>
              {analytics.totals.loggedDays ? (
                <div className="analytics-chart"><Line data={makeStepsChartData(analytics.buckets)} options={chartOptions} /></div>
              ) : <p className="analytics-empty">No step records in this range. Log activity to see your trend.</p>}
            </article>

            <article className="analytics-card">
              <div className="analytics-card-heading">
                <div><h3>Reward value</h3><p>Earned and redeemed amounts</p></div>
              </div>
              {analytics.totals.loggedDays || analytics.totals.totalRedemptions ? (
                <div className="analytics-chart"><Bar data={makePointsChartData(analytics.buckets)} options={chartOptions} /></div>
              ) : <p className="analytics-empty">No reward earnings or redemptions recorded in this range.</p>}
            </article>

            <article className="analytics-card">
              <div className="analytics-card-heading">
                <div><h3>Monthly activity map</h3><p>{analytics.heatmap.month}; blank days mean no record.</p></div>
              </div>
              {heatmapSteps.length ? <Heatmap data={analytics.heatmap} /> : <p className="analytics-empty">No step records in this month yet.</p>}
              <p className="analytics-disclosure">{analytics.estimates.basis}</p>
            </article>
          </div>
        </>
      )}
    </section>
  );
};
