import { jest } from '@jest/globals';

import colorize from '../lib/colorize.js';
import log, { enableVerbose } from '../lib/log.js';

const colors = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
};
const symbols = {
  info: ['i', 'ℹ'],
  success: ['√', '✔'],
  warning: ['‼', '⚠'],
  error: ['×', '✖'],
};
const symbolIndex = +(process.platform !== 'win32' || process.env.TERM === 'xterm-256color');

test('Default log type is “info”', () => {
  expectLog({
    symbol: symbols.info[symbolIndex],
    title: 'default',
  });
});

test('Description logged', () => {
  expectLog({
    description: 'Simple description',
    symbol: symbols.info[symbolIndex],
    title: 'Hello!',
  });
});

describe('Verbose mode', () => {
  test('Not logged if type = info & verboseOnly = true & isVerbose = false', () => {
    expectLog({
      symbol: symbols.info[symbolIndex],
      title: 'info',
      type: 'info',
      verboseOnly: true,
    });
  });

  test('Logged if type = info & verboseOnly = true & isVerbose = true', () => {
    expectLog({
      symbol: symbols.info[symbolIndex],
      title: 'info',
      type: 'info',
      verboseModeEnabled: true,
      verboseOnly: true,
    });
  });

  test('Logged if type = error & verboseOnly = true & isVerbose = false', () => {
    expectLog({
      symbol: symbols.error[symbolIndex],
      title: 'error',
      type: 'error',
      verboseOnly: true,
    });
  });
});

describe('Titles and symbols', () => {
  test('Logged “info” with symbol', () => {
    expectLog({
      symbol: symbols.info[symbolIndex],
      title: 'info',
      type: 'info',
    });
  });

  test('Logged “success” with symbol', () => {
    expectLog({
      symbol: symbols.success[symbolIndex],
      title: 'success',
      type: 'success',
    });
  });

  test('Logged “warning” with symbol', () => {
    expectLog({
      symbol: symbols.warning[symbolIndex],
      title: 'warning',
      type: 'warning',
    });
  });

  test('Logged “error” with symbol', () => {
    expectLog({
      symbol: symbols.error[symbolIndex],
      title: 'error',
      type: 'error',
    });
  });
});

function expectLog({
  description,
  symbol,
  title,
  type,
  verboseModeEnabled,
  verboseOnly,
}) {
  const symbolColored = colorize(symbol)[colors[(type || 'info')]];
  const descriptionColored = description
    ? colorize(description).dim
    : undefined;

  if (verboseModeEnabled) {
    enableVerbose();
  }

  console.log = jest.fn();
  log(title, { type, description, verboseOnly });

  if (type === 'info' && !verboseModeEnabled && verboseOnly) {
    expect(console.log.mock.calls[0]).toBeUndefined();
  } else {
    expect(console.log.mock.calls[0][0]).toBe(symbolColored);
    expect(console.log.mock.calls[0][1]).toBe(title);
    expect(console.log.mock.calls[0][4]).toBe(descriptionColored);
  }

  console.log.mockRestore();
}
