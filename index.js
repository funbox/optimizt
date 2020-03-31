const ora = require('ora');

const createWebp = require('./lib/createWebp');
const { enableVerbose } = require('./lib/log');
const optimize = require('./lib/optimize');
const prepareFilePaths = require('./lib/prepareFilePaths');

async function optimizt({ paths, webp, lossless, verbose }) {
  const spinner = ora('Processing. Please wait...').start();

  if (verbose) enableVerbose();

  if (webp) {
    await createWebp({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png']),
      spinner,
      lossless,
    });
  } else {
    await optimize({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png', 'svg']),
      spinner,
      lossless,
    });
  }

  spinner.stopAndPersist({ text: 'Done!' });
}

module.exports = optimizt;
