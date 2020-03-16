const { EOL } = require('os');

const colorize = require('./colorize');

const colors = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
};
const symbols = {
  info: ['ℹ', 'i'],
  success: ['√', '✔'],
  warning: ['‼', '⚠'],
  error: ['×', '✖'],
};
const symbolIndex = +(process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color');

module.exports = function log({ type = 'info', title = '', message }) {
  console.log(
    colorize(symbols[type][symbolIndex])[colors[type]], title,
    ...message ? [EOL, ' ', colorize(message).dim] : [],
  );
};
