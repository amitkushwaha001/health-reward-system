import { getHeatmapCells, makePointsChartData, makeStepsChartData } from './analyticsPresentation';

test('preserves unlogged activity as a chart gap rather than inventing zero-step records', () => {
  const chart = makeStepsChartData([
    { label: 'Oct 20', steps: 2400 },
    { label: 'Oct 21', steps: null },
  ]);

  expect(chart.datasets[0].data).toEqual([2400, null]);
  expect(chart.datasets[0].spanGaps).toBe(false);
});

test('maps earned and redeemed points into distinct measured series', () => {
  const chart = makePointsChartData([
    { label: 'Week 1', pointsEarned: 22, pointsRedeemed: 10 },
  ]);

  expect(chart.datasets.map((dataset) => dataset.data)).toEqual([[22], [10]]);
});

test('creates calendar offsets and retains empty heatmap days as unlogged', () => {
  const cells = getHeatmapCells({
    days: [
      { day: 1, weekday: 3, steps: null },
      { day: 2, weekday: 4, steps: 3200 },
    ],
  });

  expect(cells).toHaveLength(5);
  expect(cells.slice(0, 3).every((cell) => cell.empty)).toBe(true);
  expect(cells[3]).toMatchObject({ day: 1, steps: null, empty: false });
  expect(cells[4]).toMatchObject({ day: 2, steps: 3200, empty: false });
});
