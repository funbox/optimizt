const createWebp = require('./lib/createWebp');
const { enableVerbose } = require('./lib/log');
const optimize = require('./lib/optimize');
const prepareFilePaths = require('./lib/prepareFilePaths');
const spinner = require('./lib/spinner');

async function optimizt({ paths, webp, lossless, verbose }) {
  spinner.start();

  if (verbose) enableVerbose();

  if (webp) {
    await createWebp({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png']),
      lossless,
    });
  } else {
    await optimize({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png', 'svg']),
      lossless,
    });
  }

  spinner.stopAndPersist({ text: 'Done!' });
}

module.exports = optimizt;
