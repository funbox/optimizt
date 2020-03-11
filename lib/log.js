const colorize = require('./colorize');

const symbolIndex = +(process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color');
const symbols = {
  info: ['ℹ', 'i'],
  success: ['√', '✔'],
  warning: ['‼', '⚠'],
  error: ['×', '✖'],
};

function info(string) {
  console.log(colorize(symbols.info[symbolIndex]).blue, string);
}

function success(string) {
  console.log(colorize(symbols.success[symbolIndex]).green, string);
}

function warning(string) {
  console.log(colorize(symbols.warning[symbolIndex]).yellow, string);
}

function error(string) {
  console.error(colorize(symbols.error[symbolIndex]).red, string);
}

module.exports = { info, success, warning, error };
