import { jest } from '@jest/globals';

import showTotal from '../lib/showTotal.js';

test('Savings size and compression ratio are displayed', () => {
  const fileSize = 1048576;

  console.log = jest.fn();

  showTotal(fileSize, fileSize / 2);
  expect(console.log.mock.calls[0][1]).toBe('Yay! You saved 512 KB (50%)');

  console.log.mockRestore();
});

test('Savings size and compression ratio are not displayed', () => {
  const fileSize = 1048576;

  console.log = jest.fn();

  showTotal(fileSize, fileSize * 2);
  expect(console.log.mock.calls[0][1]).toBe('Done!');

  console.log.mockRestore();
});
