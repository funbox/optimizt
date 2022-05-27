import colorize from '../lib/colorize.js';

const isTTY = Boolean(process.stdout.isTTY);

describe('Text colors', () => {
  test('Should be black ', () => {
    const expected = isTTY ? '\x1b[30mBlack\x1b[39m' : 'Black';
    expect(colorize('Black').black).toBe(expected);
  });

  test('Should be blue', () => {
    const expected = isTTY ? '\x1b[34mBlue\x1b[39m' : 'Blue';
    expect(colorize('Blue').blue).toBe(expected);
  });

  test('Should be cyan', () => {
    const expected = isTTY ? '\x1b[36mCyan\x1b[39m' : 'Cyan';
    expect(colorize('Cyan').cyan).toBe(expected);
  });

  test('Should be green', () => {
    const expected = isTTY ? '\x1b[32mGreen\x1b[39m' : 'Green';
    expect(colorize('Green').green).toBe(expected);
  });

  test('Should be magenta', () => {
    const expected = isTTY ? '\x1b[35mMagenta\x1b[39m' : 'Magenta';
    expect(colorize('Magenta').magenta).toBe(expected);
  });

  test('Should be red', () => {
    const expected = isTTY ? '\x1b[31mRed\x1b[39m' : 'Red';
    expect(colorize('Red').red).toBe(expected);
  });

  test('Should be white', () => {
    const expected = isTTY ? '\x1b[37mWhite\x1b[39m' : 'White';
    expect(colorize('White').white).toBe(expected);
  });

  test('Should be yellow', () => {
    const expected = isTTY ? '\x1b[33mYellow\x1b[39m' : 'Yellow';
    expect(colorize('Yellow').yellow).toBe(expected);
  });
});

describe('Background colors', () => {
  test('Should be black ', () => {
    const expected = isTTY ? '\x1b[40mBlack background\x1b[0m' : 'Black background';
    expect(colorize('Black background').bgBlack).toBe(expected);
  });

  test('Should be blue', () => {
    const expected = isTTY ? '\x1b[44mBlue background\x1b[0m' : 'Blue background';
    expect(colorize('Blue background').bgBlue).toBe(expected);
  });

  test('Should be cyan', () => {
    const expected = isTTY ? '\x1b[46mCyan background\x1b[0m' : 'Cyan background';
    expect(colorize('Cyan background').bgCyan).toBe(expected);
  });

  test('Should be green', () => {
    const expected = isTTY ? '\x1b[42mGreen background\x1b[0m' : 'Green background';
    expect(colorize('Green background').bgGreen).toBe(expected);
  });

  test('Should be magenta', () => {
    const expected = isTTY ? '\x1b[45mMagenta background\x1b[0m' : 'Magenta background';
    expect(colorize('Magenta background').bgMagenta).toBe(expected);
  });

  test('Should be red', () => {
    const expected = isTTY ? '\x1b[41mRed background\x1b[0m' : 'Red background';
    expect(colorize('Red background').bgRed).toBe(expected);
  });

  test('Should be white', () => {
    const expected = isTTY ? '\x1b[47mWhite background\x1b[0m' : 'White background';
    expect(colorize('White background').bgWhite).toBe(expected);
  });

  test('Should be yellow', () => {
    const expected = isTTY ? '\x1b[43mYellow background\x1b[0m' : 'Yellow background';
    expect(colorize('Yellow background').bgYellow).toBe(expected);
  });
});

describe('Other', () => {
  test('Text should be dimmed', () => {
    const expected = isTTY ? '\x1b[2mDimmed\x1b[22m' : 'Dimmed';
    expect(colorize('Dimmed').dim).toBe(expected);
  });

  test('Text should be reset', () => {
    const expected = isTTY ? '\x1b[0m\x1b[31mReset\x1b[39m\x1b[0m' : 'Reset';
    expect(colorize(colorize('Reset').red).reset).toBe(expected);
  });

  test('Colorize arguments are concatenated', () => {
    const expected = isTTY ? '\x1b[0m1 2 3\x1b[0m' : '1 2 3';
    expect(colorize(1, 2, 3).reset).toBe(expected);
  });
});
