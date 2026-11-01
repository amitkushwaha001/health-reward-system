import React from 'react';
import { Bar } from 'react-chartjs-2';
import './registerCharts';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

export const AdminReportCharts = ({ reports }) => {
  const transactions = [...(reports.rewardTransactions || [])].reverse();
  const redemptions = reports.redemptionHistory || [];

  return (
    <div className="admin-report-charts">
      <article className="card">
        <div className="card-header">
          <h2>Steps recorded by day</h2>
        </div>
        {transactions.length ? (
          <div className="analytics-chart" role="img" aria-label="Daily steps recorded chart">
            <Bar
              data={{
                labels: transactions.map((item) => item._id),
                datasets: [{
                  label: 'Steps',
                  data: transactions.map((item) => item.totalSteps),
                  backgroundColor: '#17865b',
                  borderRadius: 5,
                }],
              }}
              options={chartOptions}
            />
          </div>
        ) : <p className="analytics-empty">No activity records are available for this report.</p>}
      </article>
      <article className="card">
        <div className="card-header">
          <h2>Redemptions by category</h2>
        </div>
        {redemptions.length ? (
          <div className="analytics-chart" role="img" aria-label="Redemptions by reward category chart">
            <Bar
              data={{
                labels: redemptions.map((item) => item._id),
                datasets: [{
                  label: 'Redemptions',
                  data: redemptions.map((item) => item.count),
                  backgroundColor: '#e5a84b',
                  borderRadius: 5,
                }],
              }}
              options={chartOptions}
            />
          </div>
        ) : <p className="analytics-empty">No redemption records are available for this report.</p>}
      </article>
    </div>
  );
};
