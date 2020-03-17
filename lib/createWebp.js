const fs = require('fs');
const path = require('path');

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

const formatBytes = require('../lib/formatBytes');
const log = require('../lib/log');

async function createWebp({ paths, spinner, lossless, verbose }) {
  if (!paths.length) return;

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

    if (fileSize > fileSizeOptimized && ratio < 0) {
      log({
        type: 'success',
        title: saveFilePath,
        message: `${formatBytes(fileSize)} → ${formatBytes(fileSizeOptimized)}. Ratio: ${ratio}%`,
      });

      fs.writeFileSync(saveFilePath, file.data);
    } else if (verbose) {
      log({
        type: 'error',
        title: file.sourcePath,
        message: 'File size increased',
      });
    }
  });

  spinner.succeed('Creating WebP completed');
}

module.exports = createWebp;
