#!/usr/bin/env node


const ora = require('ora');

const createWebp = require('./lib/createWebp');
const optimize = require('./lib/optimize');
const prepareFilePaths = require('./lib/prepareFilePaths');

async function optimizt({ paths, webp, lossless, verbose }) {
  const spinner = ora('Processing. Please wait...').start();

  if (webp) {
    await createWebp({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png']),
      spinner,
      lossless,
      verbose,
    });
  } else {
    await optimize({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png', 'svg']),
      spinner,
      lossless,
      verbose,
    });
  }

  spinner.stopAndPersist({ text: 'Done!' });
}

module.exports = optimizt;
