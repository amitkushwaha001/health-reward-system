import { formatRewardBalance } from './rewardCurrency';

test('formats paise balances as rupees', () => {
  expect(formatRewardBalance(10)).toBe('₹0.10');
  expect(formatRewardBalance(1000)).toBe('₹10.00');
});
