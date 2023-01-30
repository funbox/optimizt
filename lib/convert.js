import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import CliProgress from 'cli-progress';
import execBuffer from 'exec-buffer';
import gif2webp from 'gif2webp-bin';
import pLimit from 'p-limit';
import sharp from 'sharp';

import calcRatio from './calcRatio.js';
import formatBytes from './formatBytes.js';
import getImageFormat from './getImageFormat.js';
import getPlural from './getPlural.js';
import log from './log.js';
import optionsToArguments from './optionsToArguments.js';
import prepareWriteFilePath from './prepareWriteFilePath.js';
import showTotal from './showTotal.js';

export default async function convert({ paths, lossless, avif, webp, force, output: outputDir, config }) {
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
        outputDir,
        config: config?.avif || {},
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
        outputDir,
        config: {
          webp: config?.webp || {},
          webpGif: config?.webpGif || {},
        },
      })));
    }

    return acc;
  }, []);

  const totalSize = { before: 0, after: 0 };
  const tasksResult = await Promise.all(tasks);

  tasksResult
    .filter(Boolean)
    .forEach(({ fileBuffer, filePath, outputFormat } = {}) => {
      const fileSize = {
        before: fs.statSync(filePath).size,
        after: fileBuffer.length,
      };
      const isOptimized = fileSize.before > fileSize.after;

      totalSize.before += fileSize.before;
      totalSize.after += isOptimized ? fileSize.after : fileSize.before;

      checkResult({ fileBuffer, filePath, fileSize, outputFormat, force, outputDir });
    });

  tasksErrors.forEach(error => log(...error));

  console.log();
  showTotal(totalSize.before, totalSize.after);
}

function getOutputFilePath(filePath, outputFormat) {
  const { dir, name } = path.parse(filePath);
  return path.join(dir, `${name}.${outputFormat.toLowerCase()}`);
}

function checkResult({ fileBuffer, filePath, fileSize, outputFormat, force, outputDir }) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

  const writeFilePath = prepareWriteFilePath(getOutputFilePath(filePath, outputFormat), outputDir);
  const before = formatBytes(fileSize.before);
  const after = formatBytes(fileSize.after);
  const ratio = calcRatio(fileSize.before, fileSize.after);
  const successMessage = `${before} → ${outputFormat} ${after}. Ratio: ${ratio}%`;

  const isChanged = !fs.readFileSync(filePath).equals(fileBuffer);
  const isOptimised = ratio > 0;

  if (isOptimised || force) {
    try {
      fs.writeFileSync(writeFilePath, fileBuffer, { flag: force ? 'w' : 'wx' });

      log(filePath, {
        type: 'success',
        description: successMessage,
      });
    } catch (error) {
      if (error.message) {
        log(filePath, {
          type: 'error',
          description: error.message,
        });
      } else {
        console.error(error);
      }
    }
  } else {
    log(filePath, {
      description: `${isChanged ? 'File size increased' : 'Nothing changed'}. Conversion to ${outputFormat} skipped`,
      verboseOnly: true,
    });
  }
}

function processImage({ filePath, convertFunction, lossless, outputFormat, force, progressBar, tasksErrors, outputDir, config }) {
  const writeFilePath = prepareWriteFilePath(getOutputFilePath(filePath, outputFormat), outputDir);

  return fs.promises.readFile(filePath)
    .then(fileBuffer => {
      if (!force && fs.existsSync(writeFilePath)) {
        throw new Error(`File already exists, '${writeFilePath}'`);
      }

      return convertFunction({
        fileBuffer,
        fileExt: path.extname(filePath).toLowerCase(),
        lossless,
        config,
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

async function createAvif({ fileBuffer, lossless, config }) {
  const imageFormat = await getImageFormat(fileBuffer);

  if (!['jpeg', 'png', 'gif'].includes(imageFormat)) {
    return fileBuffer;
  }

  return sharp(fileBuffer)
    .avif((lossless ? config?.lossless : config?.lossy) || {})
    .toBuffer();
}

async function createWebp({ fileBuffer, fileExt, lossless, config }) {
  const imageFormat = await getImageFormat(fileBuffer);

  switch (fileExt) {
    case '.gif':
      if (imageFormat !== 'gif') {
        return fileBuffer;
      }

      return execBuffer({
        bin: gif2webp,
        args: [
          ...optionsToArguments({
            options: (lossless ? config?.webpGif?.lossless : config?.webpGif?.lossy) || {},
            prefix: '-',
          }),
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
        .webp((lossless ? config?.webp?.lossless : config?.webp?.lossy) || {})
        .toBuffer();
  }
}
