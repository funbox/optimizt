const calcRatio = require('./calcRatio');
const formatBytes = require('./formatBytes');
const { log } = require('./log');

function showTotal(before, after) {
  const ratio = calcRatio(before, after);
  const saved = formatBytes(before - after);

  if (ratio > 0) {
    log(`Yay! You saved ${saved} (${ratio}%)`);
  } else {
    log('Done!');
  }
}

module.exports = showTotal;
