const fs = require('fs');
const os = require('os');
const path = require('path');

const execBuffer = require('exec-buffer');
const gif2webp = require('gif2webp-bin');
const pLimit = require('p-limit');
const sharp = require('sharp');

const calcRatio = require('../lib/calcRatio');
const getImageFormat = require('../lib/getImageFormat');
const formatBytes = require('../lib/formatBytes');
const getPlural = require('../lib/getPlural');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

async function convert({ paths, lossless, avif, webp }) {
  const totalPaths = paths.length;

  if (!totalPaths) return;

  if (lossless) {
    spinner.info('Lossless conversion may take a long time');
  }

  spinner.start(`Converting ${totalPaths} ${getPlural(totalPaths, 'image', 'images')}...`);

  const limit = pLimit(os.cpus().length);
  const tasks = paths.reduce((acc, filePath) => {
    if (avif) {
      acc.push(limit(() => processImage({
        convertFunction: createAvif,
        outputFormat: 'AVIF',
        filePath,
        lossless,
      })));
    }

    if (webp) {
      acc.push(limit(() => processImage({
        convertFunction: createWebp,
        outputFormat: 'WebP',
        filePath,
        lossless,
      })));
    }

    return acc;
  }, []);

  const tasksResult = await Promise.all(tasks);

  spinner.clear();
  tasksResult.forEach(({
    fileBuffer,
    filePath,
    outputFormat,
  } = {}) => checkResult({ fileBuffer, filePath, outputFormat }));

  console.log();
  spinner.succeed('Converting completed');
}

function getOutputFilePath(filePath, outputFormat) {
  const { dir, name } = path.parse(filePath);
  return path.join(dir, `${name}.${outputFormat.toLowerCase()}`);
}

function checkResult({ fileBuffer, filePath, outputFormat }) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

  const destPath = getOutputFilePath(filePath, outputFormat);

  const fileSizeBefore = fs.statSync(filePath).size;
  const fileSizeAfter = fileBuffer.length;
  const ratio = calcRatio(fileSizeBefore, fileSizeAfter);

  if (ratio > 0) {
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
          title: destPath,
          message: error.message,
        });
      } else {
        console.error(error);
      }
    }
  } else if (!fs.readFileSync(filePath).equals(fileBuffer)) {
    log({
      title: filePath,
      message: `File size increased. Conversion to ${outputFormat} skipped`,
    });
  } else {
    log({
      title: filePath,
      message: `Nothing changed. Conversion to ${outputFormat} skipped`,
    });
  }
}

function processImage({ filePath, convertFunction, lossless, outputFormat }) {
  const destPath = getOutputFilePath(filePath, outputFormat);

  return fs.promises.readFile(filePath)
    .then(fileBuffer => {
      if (fs.existsSync(destPath)) {
        throw new Error(`File already exists, '${destPath}'`);
      }

      return convertFunction({
        fileBuffer,
        fileExt: path.extname(filePath).toLowerCase(),
        lossless,
      });
    })
    .then(fileBuffer => ({ fileBuffer, filePath, outputFormat }))
    .catch(error => {
      spinner.clear();
      log({
        type: 'error',
        title: filePath,
        message: error.message,
      });
    });
}

async function createAvif({ fileBuffer, lossless }) {
  const imageFormat = await getImageFormat(fileBuffer);

  if (!['jpeg', 'png', 'gif'].includes(imageFormat)) {
    return fileBuffer;
  }

  return sharp(fileBuffer)
    .avif({
      quality: 50,
      lossless,
    })
    .toBuffer();
}

async function createWebp({ fileBuffer, fileExt, lossless }) {
  const imageFormat = await getImageFormat(fileBuffer);

  switch (fileExt) {
    case '.gif':
      if (imageFormat !== 'gif') {
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
      if (!['jpeg', 'png'].includes(imageFormat)) {
        return fileBuffer;
      }

      return sharp(fileBuffer)
        .webp({
          quality: 85,
          lossless,
        })
        .toBuffer();
  }
}

module.exports = convert;
