export default function colorize(...args) {
  const str = args.join(' ');
  const isTTY = Boolean(process.stdout.isTTY);
  const buildColor = (start, end) => `${isTTY ? start : ''}${str}${isTTY ? end : ''}`;

  return {
    dim: buildColor('\x1b[2m', '\x1b[22m'),
    reset: buildColor('\x1b[0m', '\x1b[0m'),

    black: buildColor('\x1b[30m', '\x1b[39m'),
    blue: buildColor('\x1b[34m', '\x1b[39m'),
    cyan: buildColor('\x1b[36m', '\x1b[39m'),
    green: buildColor('\x1b[32m', '\x1b[39m'),
    magenta: buildColor('\x1b[35m', '\x1b[39m'),
    red: buildColor('\x1b[31m', '\x1b[39m'),
    white: buildColor('\x1b[37m', '\x1b[39m'),
    yellow: buildColor('\x1b[33m', '\x1b[39m'),

    bgBlack: buildColor('\x1b[40m', '\x1b[0m'),
    bgBlue: buildColor('\x1b[44m', '\x1b[0m'),
    bgCyan: buildColor('\x1b[46m', '\x1b[0m'),
    bgGreen: buildColor('\x1b[42m', '\x1b[0m'),
    bgMagenta: buildColor('\x1b[45m', '\x1b[0m'),
    bgRed: buildColor('\x1b[41m', '\x1b[0m'),
    bgWhite: buildColor('\x1b[47m', '\x1b[0m'),
    bgYellow: buildColor('\x1b[43m', '\x1b[0m'),
  };
}
