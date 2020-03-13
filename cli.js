#!/usr/bin/env node

const program = require('commander');
const optimizt = require('.');

program
  .option('--webp', 'create WebP and exit')
  .option('-l, --lossless', 'perform lossless optimizations');

program
  .usage('[options] <dir> <file ...>')
  .version(require('./package').version, '-v, --version')
  .description(require('./package').description)
  .parse(process.argv);

if (!program.args.length) {
  program.help();
} else {
  optimizt({
    paths: program.args,
    webp: program.webp,
    lossless: program.lossless,
  });
}
