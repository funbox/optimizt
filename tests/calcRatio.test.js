const calcRatio = require('../lib/calcRatio');

test('Ratio should be “50” if the file size has decreased by 50%', () => {
  expect(calcRatio(1000000, 500000)).toBe(50);
});

test('Ratio should be “-100” if the file size has increased by 100%', () => {
  expect(calcRatio(500000, 1000000)).toBe(-100);
});
