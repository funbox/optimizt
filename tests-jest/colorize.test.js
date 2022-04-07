const colorize = require('../lib/colorize');

describe('Text colors', () => {
  test('Should be black ', () => {
    expect(colorize('Black').black).toBe('\x1b[30mBlack\x1b[39m');
  });

  test('Should be blue', () => {
    expect(colorize('Blue').blue).toBe('\x1b[34mBlue\x1b[39m');
  });

  test('Should be cyan', () => {
    expect(colorize('Cyan').cyan).toBe('\x1b[36mCyan\x1b[39m');
  });

  test('Should be green', () => {
    expect(colorize('Green').green).toBe('\x1b[32mGreen\x1b[39m');
  });

  test('Should be magenta', () => {
    expect(colorize('Magenta').magenta).toBe('\x1b[35mMagenta\x1b[39m');
  });

  test('Should be red', () => {
    expect(colorize('Red').red).toBe('\x1b[31mRed\x1b[39m');
  });

  test('Should be white', () => {
    expect(colorize('White').white).toBe('\x1b[37mWhite\x1b[39m');
  });

  test('Should be yellow', () => {
    expect(colorize('Yellow').yellow).toBe('\x1b[33mYellow\x1b[39m');
  });
});

describe('Background colors', () => {
  test('Should be black ', () => {
    expect(colorize('Black background').bgBlack).toBe('\x1b[40mBlack background\x1b[0m');
  });

  test('Should be blue', () => {
    expect(colorize('Blue background').bgBlue).toBe('\x1b[44mBlue background\x1b[0m');
  });

  test('Should be cyan', () => {
    expect(colorize('Cyan background').bgCyan).toBe('\x1b[46mCyan background\x1b[0m');
  });

  test('Should be green', () => {
    expect(colorize('Green background').bgGreen).toBe('\x1b[42mGreen background\x1b[0m');
  });

  test('Should be magenta', () => {
    expect(colorize('Magenta background').bgMagenta).toBe('\x1b[45mMagenta background\x1b[0m');
  });

  test('Should be red', () => {
    expect(colorize('Red background').bgRed).toBe('\x1b[41mRed background\x1b[0m');
  });

  test('Should be white', () => {
    expect(colorize('White background').bgWhite).toBe('\x1b[47mWhite background\x1b[0m');
  });

  test('Should be yellow', () => {
    expect(colorize('Yellow background').bgYellow).toBe('\x1b[43mYellow background\x1b[0m');
  });
});

describe('Other', () => {
  test('Text should be dimmed', () => {
    expect(colorize('Dimmed').dim).toBe('\x1b[2mDimmed\x1b[22m');
  });

  test('Text should be reset', () => {
    expect(colorize(colorize('Reset').red).reset).toBe('\x1b[0m\x1b[31mReset\x1b[39m\x1b[0m');
  });

  test('Colorize arguments are concatenated', () => {
    expect(colorize(1, 2, 3).reset).toBe('\x1b[0m1 2 3\x1b[0m');
  });
});
