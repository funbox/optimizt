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

let isVerbose = false;

function enableVerbose() {
  isVerbose = true;
}

function log({ type = 'info', title = '', message }) {
  if (!isVerbose && type === 'info') return;

  console.log(
    colorize(symbols[type][symbolIndex])[colors[type]], title,
    ...message ? [EOL, ' ', colorize(message).dim] : [],
  );
}

module.exports = { enableVerbose, log };
