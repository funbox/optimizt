const fs = require('fs');
const os = require('os');
const path = require('path');

const CliProgress = require('cli-progress');
const execBuffer = require('exec-buffer');
const gif2webp = require('gif2webp-bin');
const pLimit = require('p-limit');
const sharp = require('sharp');

const calcRatio = require('../lib/calcRatio');
const getImageFormat = require('../lib/getImageFormat');
const formatBytes = require('../lib/formatBytes');
const getPlural = require('../lib/getPlural');
const { log } = require('../lib/log');
const showTotal = require('../lib/showTotal');

async function convert({ paths, lossless, avif, webp, force }) {
  const totalPaths = paths.length;

  if (!totalPaths) return;

  log(`Converting ${totalPaths} ${getPlural(totalPaths, 'image', 'images')} (${lossless ? 'lossless' : 'lossy'})...`);
  if (lossless) log('Lossless conversion may take a long time');

  const progressBar = new CliProgress.SingleBar({
    format: `{bar} {percentage}% | Processed {value} of {total} ${getPlural(totalPaths, 'image', 'images')}`,
    clearOnComplete: true,
    stopOnComplete: true,
  }, CliProgress.Presets.shades_classic);

  progressBar.start(totalPaths, 0);

  const limit = pLimit(os.cpus().length);

  const tasksErrors = [];

  const tasks = paths.reduce((acc, filePath) => {
    if (avif) {
      acc.push(limit(() => processImage({
        convertFunction: createAvif,
        outputFormat: 'AVIF',
        progressBar,
        filePath,
        lossless,
        force,
        tasksErrors,
      })));
    }

    if (webp) {
      acc.push(limit(() => processImage({
        convertFunction: createWebp,
        outputFormat: 'WebP',
        progressBar,
        filePath,
        lossless,
        force,
        tasksErrors,
      })));
    }

    return acc;
  }, []);

  const totalSize = { before: 0, after: 0 };
  const tasksResult = await Promise.all(tasks);

  tasksResult.forEach(({ fileBuffer, filePath, outputFormat } = {}) => {
    const fileSize = {
      before: fs.statSync(filePath).size,
      after: fileBuffer.length,
    };

    totalSize.before += fileSize.before;
    totalSize.after += fileSize.after;

    checkResult({ fileBuffer, filePath, fileSize, outputFormat, force });
  });
  tasksErrors.forEach(error => log(...error));

  console.log();
  showTotal(totalSize.before, totalSize.after);
}

function getOutputFilePath(filePath, outputFormat) {
  const { dir, name } = path.parse(filePath);
  return path.join(dir, `${name}.${outputFormat.toLowerCase()}`);
}

function checkResult({ fileBuffer, filePath, fileSize, outputFormat, force }) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

  const destPath = getOutputFilePath(filePath, outputFormat);
  const ratio = calcRatio(fileSize.before, fileSize.after);

  if (ratio > 0 || force) {
    try {
      const before = formatBytes(fileSize.before);
      const after = formatBytes(fileSize.after);

      fs.writeFileSync(destPath, fileBuffer, { flag: force ? 'w' : 'wx' });

      log(destPath, {
        type: 'success',
        description: `${before} → ${after}. Ratio: ${ratio}%`,
      });
    } catch (error) {
      if (error.message) {
        log(destPath, {
          type: 'error',
          description: error.message,
        });
      } else {
        console.error(error);
      }
    }
  } else if (!fs.readFileSync(filePath).equals(fileBuffer)) {
    log(filePath, {
      description: `File size increased. Conversion to ${outputFormat} skipped`,
      verboseOnly: true,
    });
  } else {
    log(filePath, {
      description: `Nothing changed. Conversion to ${outputFormat} skipped`,
      verboseOnly: true,
    });
  }
}

function processImage({ filePath, convertFunction, lossless, outputFormat, force, progressBar, tasksErrors }) {
  const destPath = getOutputFilePath(filePath, outputFormat);

  return fs.promises.readFile(filePath)
    .then(fileBuffer => {
      if (!force && fs.existsSync(destPath)) {
        throw new Error(`File already exists, '${destPath}'`);
      }

      return convertFunction({
        fileBuffer,
        fileExt: path.extname(filePath).toLowerCase(),
        lossless,
      });
    })
    .then(fileBuffer => {
      progressBar.increment();
      return { fileBuffer, filePath, outputFormat };
    })
    .catch(error => {
      progressBar.increment();
      tasksErrors.push([filePath, {
        type: 'error',
        description: (error.message || '').trim(),
      }]);
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
