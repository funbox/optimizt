#!/usr/bin/env node


const ora = require('ora');

const createWebp = require('./lib/createWebp');
const optimize = require('./lib/optimize');
const prepareFilePaths = require('./lib/prepareFilePaths');

async function optimizt({ paths, webp, lossless, verbose }) {
  const spinner = ora('Processing. Please wait...').start();
  const pathsList = prepareFilePaths(paths);

  const params = { spinner, paths: pathsList, lossless, verbose };

  if (webp) {
    await createWebp(params);
  } else {
    await optimize(params);
  }

  spinner.stop();
}

module.exports = optimizt;
