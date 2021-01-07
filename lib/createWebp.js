const fs = require('fs');
const os = require('os');
const path = require('path');

const pLimit = require('p-limit');
const sharp = require('sharp');

const calcRatio = require('../lib/calcRatio');
const formatBytes = require('../lib/formatBytes');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

async function createWebp({ paths, lossless }) {
  if (!paths.length) return;

  spinner.start(`Creating WebP for ${paths.length} images...`);

  const limit = pLimit(os.cpus().length);

  const tasks = paths.map(filePath => limit(() => fs.promises.readFile(filePath)
    .then(fileBuffer => sharp(fileBuffer)
      .webp({
        quality: 85,
        lossless,
      })
      .toBuffer())
    .then(fileBuffer => ({ fileBuffer, filePath }))));

  const tasksResult = await Promise.all(tasks);

  spinner.clear();
  tasksResult.forEach(({ fileBuffer, filePath }) => checkResult(fileBuffer, filePath));

  console.log();
  spinner.succeed('Creating WebP completed');
}

function checkResult(fileBuffer, filePath) {
  const { dir, name } = path.parse(filePath);
  const destPath = path.join(dir, `${name}.webp`);

  const fileSizeBefore = fs.statSync(filePath).size;
  const fileSizeAfter = fileBuffer.length;
  const ratio = calcRatio(fileSizeBefore, fileSizeAfter);

  if (ratio < 0) {
    try {
      fs.writeFileSync(destPath, fileBuffer, { flag: 'wx' });

      log({
        type: 'success',
        title: destPath,
        message: `${formatBytes(fileSizeBefore)} → ${formatBytes(fileSizeAfter)}. Ratio: ${ratio}%`,
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
      title: filePath,
      message: 'File size increased. Skipped',
    });
  }
}

module.exports = createWebp;
