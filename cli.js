#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { program } from 'commander';

import optimizt from './index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(await fs.readFile(path.join(dirname, 'package.json')));

program
  .option('--avif', 'create AVIF and exit')
  .option('--webp', 'create WebP and exit')
  .option('-f, --force', 'force create AVIF and WebP')
  .option('-l, --lossless', 'perform lossless optimizations')
  .option('-v, --verbose', 'be verbose')
  .option('-c, --config <path>', 'use this configuration, overriding default config options if present')
  .option('-o, --output <path>', 'write output to directory');

program
  .usage('[options] <dir> <file ...>')
  .version(packageJson.version, '-V, --version')
  .description(packageJson.description)
  .parse(process.argv);

if (!program.args.length) {
  program.help();
} else {
  optimizt({
    paths: program.args,
    ...program.opts(),
  });
}

process.on('unhandledRejection', error => {
  console.error(error);
});
