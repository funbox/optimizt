const fs = require('fs');
const path = require('path');

const { log } = require('./log');

module.exports = function prepareOutputPath(outputPath) {
  if (!outputPath) return '';

  const resolvedPath = path.resolve(outputPath);

  if (!fs.existsSync(resolvedPath)) {
    logErrorAndExit('Output path does not exist');
  }

  if (!fs.lstatSync(resolvedPath).isDirectory()) {
    logErrorAndExit('Output path must be a directory');
  }

  return resolvedPath;
};

function logErrorAndExit(title) {
  log(title, { type: 'error' });
  process.exit(1);
}
