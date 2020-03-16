const fs = require('fs');
const { EOL } = require('os');
const path = require('path');

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

const colorize = require('../lib/colorize');
const formatBytes = require('../lib/formatBytes');
const { error, success } = require('../lib/log');

async function createWebp({ spinner, paths, lossless, verbose }) {
  spinner.start(`Creating WebP for ${paths.length} images...`);

  const webp = await imagemin(paths, {
    plugins: [
      imageminWebp({
        quality: 80,
        sns: 50,
        lossless,
      }),
    ],
  });

  spinner.clear();

  webp.forEach(file => {
    const { dir, name } = path.parse(file.sourcePath);
    const saveFilePath = path.join(dir, `${name}.webp`);

    const fileSize = fs.statSync(file.sourcePath).size;
    const fileSizeOptimized = file.data.byteLength;
    const ratio = Math.round((fileSizeOptimized - fileSize) / fileSize * 100.0);

    if (fileSize > fileSizeOptimized) {
      success(saveFilePath);
      console.log(' ', colorize(`${formatBytes(fileSize)} → ${formatBytes(fileSizeOptimized)}. Ratio: ${ratio}%`).dim, EOL);

      fs.writeFileSync(saveFilePath, file.data);
    } else if (verbose) {
      error(file.sourcePath);
      console.log(' ', colorize('WebP file is bigger than original. Skipped.').dim, EOL);
    }
  });

  spinner.succeed('Creating WebP completed');
  console.log(' ', '---', EOL, EOL);
}

module.exports = createWebp;
