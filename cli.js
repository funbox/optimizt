#!/usr/bin/env node

const { program } = require('commander');
const optimizt = require('.');

program
  .option('--avif', 'create AVIF and exit')
  .option('--webp', 'create WebP and exit')
  .option('--force', 'force create AVIF and WebP')
  .option('-l, --lossless', 'perform lossless optimizations (WebP and AVIF only)')
  .option('-v, --verbose', 'be verbose');

program
  .usage('[options] <dir> <file ...>')
  .version(require('./package.json').version, '-V, --version')
  .description(require('./package.json').description)
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
