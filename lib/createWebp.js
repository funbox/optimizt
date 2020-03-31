const fs = require('fs');
const path = require('path');

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

const formatBytes = require('../lib/formatBytes');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

async function createWebp({ paths, lossless }) {
  if (!paths.length) return;

  spinner.start(`Creating WebP for ${paths.length} images...`);

  const webp = await imagemin(paths, {
    plugins: [
      imageminWebp({
        quality: 85,
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
      try {
        fs.writeFileSync(saveFilePath, file.data, { flag: 'wx' });

        log({
          type: 'success',
          title: saveFilePath,
          message: `${formatBytes(fileSize)} → ${formatBytes(fileSizeOptimized)}. Ratio: ${ratio}%`,
        });
      } catch (error) {
        if (error.message) {
          log({
            type: 'error',
            title: error.message,
          });
        } else {
          console.error(error);
        }
      }
    } else {
      log({
        title: file.sourcePath,
        message: 'File size increased. Skipped',
      });
    }
  });

  spinner.succeed('Creating WebP completed');
}

module.exports = createWebp;
