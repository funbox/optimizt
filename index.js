const convert = require('./lib/convert');
const { enableVerbose } = require('./lib/log');
const optimize = require('./lib/optimize');
const prepareFilePaths = require('./lib/prepareFilePaths');
const prepareOutputPath = require('./lib/prepareOutputPath');

async function optimizt({ paths, avif, webp, force, lossless, verbose, output }) {
  if (verbose) enableVerbose();

  if (avif || webp) {
    await convert({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png']),
      lossless,
      avif,
      webp,
      force,
      output: prepareOutputPath(output),
    });
  } else {
    await optimize({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png', 'svg']),
      lossless,
      output: prepareOutputPath(output),
    });
  }
}

module.exports = optimizt;
