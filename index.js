#!/usr/bin/env node


const ora = require('ora');

const createWebp = require('./lib/createWebp');
const optimize = require('./lib/optimize');
const prepareFilePaths = require('./lib/prepareFilePaths');

async function optimizt({ paths, webp, lossless }) {
  const spinner = ora('Processing. Please wait...').start();
  const pathsList = prepareFilePaths(paths);

  if (webp) {
    await createWebp({ spinner, paths: pathsList });
  } else {
    await optimize({ spinner, paths: pathsList, lossless });
  }

  spinner.stop();
}

module.exports = optimizt;
