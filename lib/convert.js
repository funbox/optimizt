const fs = require('fs');
const os = require('os');
const path = require('path');

const execBuffer = require('exec-buffer');
const gif2webp = require('gif2webp-bin');
const pLimit = require('p-limit');
const sharp = require('sharp');

const calcRatio = require('../lib/calcRatio');
const fileType = require('../lib/fileType');
const formatBytes = require('../lib/formatBytes');
const getPlural = require('../lib/getPlural');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

async function convert({ paths, lossless }) {
  const totalPaths = paths.length;

  if (!totalPaths) return;

  spinner.start(`Creating WebP for ${totalPaths} ${getPlural(totalPaths, 'image', 'images')}...`);

  const limit = pLimit(os.cpus().length);

  const tasks = paths.map(filePath => limit(() => fs.promises.readFile(filePath)
    .then(fileBuffer => createWebp({
      fileBuffer,
      fileExt: path.extname(filePath).toLowerCase(),
      lossless,
    }))
    .then(fileBuffer => ({ fileBuffer, filePath }))
    .catch(error => {
      spinner.clear();
      log({
        type: 'error',
        title: filePath,
        message: error.message,
      });
    })));

  const tasksResult = await Promise.all(tasks);

  spinner.clear();
  tasksResult.forEach(({ fileBuffer, filePath } = {}) => checkResult(fileBuffer, filePath));

  console.log();
  spinner.succeed('Creating WebP completed');
}

function checkResult(fileBuffer, filePath) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

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

function createWebp({ fileBuffer, fileExt, lossless }) {
  const fileTypeByBuffer = fileType(fileBuffer);

  switch (fileExt) {
    case '.gif':
      if (fileTypeByBuffer !== 'gif') {
        return fileBuffer;
      }

      return execBuffer({
        bin: gif2webp,
        args: [
          ...lossless ? '' : ['-lossy', '-min_size'],
          execBuffer.input,
          '-o',
          execBuffer.output,
        ],
        input: fileBuffer,
      });

    default:
      if (fileTypeByBuffer === 'jpeg' || fileTypeByBuffer === 'png') {
        return sharp(fileBuffer).webp({ quality: 85, lossless }).toBuffer();
      }

      return fileBuffer;
  }
}

module.exports = convert;
