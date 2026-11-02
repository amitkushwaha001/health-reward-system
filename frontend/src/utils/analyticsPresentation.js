export const makeStepsChartData = (buckets = []) => ({
  labels: buckets.map((bucket) => bucket.label),
  datasets: [{
    label: 'Steps logged',
    data: buckets.map((bucket) => bucket.steps),
    borderColor: '#17865b',
    backgroundColor: 'rgba(23, 134, 91, 0.12)',
    fill: true,
    tension: 0.32,
    spanGaps: false,
  }],
});

export const makePointsChartData = (buckets = []) => ({
  labels: buckets.map((bucket) => bucket.label),
  datasets: [
    {
      label: 'Earned (₹)',
      data: buckets.map((bucket) => bucket.pointsEarned === null ? null : bucket.pointsEarned / 100),
      backgroundColor: '#17865b',
      borderRadius: 6,
    },
    {
      label: 'Redeemed (₹)',
      data: buckets.map((bucket) => bucket.pointsRedeemed / 100),
      backgroundColor: '#e5a84b',
      borderRadius: 6,
    },
  ],
});

export const getHeatmapCells = (heatmap) => {
  const days = heatmap?.days || [];
  const firstDayOffset = days[0]?.weekday || 0;
  return [
    ...Array.from({ length: firstDayOffset }, (_, index) => ({ key: `offset-${index}`, empty: true })),
    ...days.map((day) => ({
      key: day.day,
      day: day.day,
      steps: day.steps,
      empty: false,
    })),
  ];
};
