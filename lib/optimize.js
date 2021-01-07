const fs = require('fs');
const os = require('os');
const path = require('path');

const execBuffer = require('exec-buffer');
const gifsicle = require('gifsicle');
const guetzli = require('guetzli');
const pLimit = require('p-limit');
const pngquant = require('pngquant-bin');
const sharp = require('sharp');
const SVGO = require('svgo');

const calcRatio = require('../lib/calcRatio');
const formatBytes = require('../lib/formatBytes');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

const svgoConfig = require('../svgo/config');

async function optimize({ paths, lossless: isLossless }) {
  if (!paths.length) return;

  spinner.start(`Optimizing ${paths.length} images (${isLossless ? 'lossless' : 'lossy'})...`);

  const limit = pLimit(
    /*
      Guetzli uses a large amount of memory and a significant amount of CPU time.
      To reduce the processor load in lossless mode, we reduce the number
      of simultaneous tasks by half.
     */
    isLossless ? Math.round(os.cpus().length / 2) : os.cpus().length,
  );

  const tasks = paths.map(filePath => limit(() => fs.promises.readFile(filePath)
    .then(fileBuffer => optimizeByType({
      fileBuffer,
      fileExt: path.extname(filePath).toLowerCase(),
      isLossless,
    })))
    .then(fileBuffer => ({ fileBuffer, filePath })));

  const tasksResult = await Promise.all(tasks);

  spinner.clear();
  tasksResult.forEach(({ fileBuffer, filePath }) => checkResult(fileBuffer, filePath));

  console.log();
  spinner.succeed('Optimizing completed');
}

function checkResult(fileBuffer, filePath) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

  const fileExt = path.extname(filePath).toLowerCase();
  const fileSizeBefore = fs.statSync(filePath).size;
  const fileSizeAfter = fileBuffer.length;
  const ratio = calcRatio(fileSizeBefore, fileSizeAfter);

  const successMessage = `${formatBytes(fileSizeBefore)} → ${formatBytes(fileSizeAfter)}. Ratio: ${ratio > 0 ? `+${ratio}` : ratio}%`;

  if (ratio < 0) {
    fs.writeFileSync(filePath, fileBuffer);

    log({
      type: 'success',
      title: filePath,
      message: successMessage,
    });
  } else if (!fs.readFileSync(filePath).equals(fileBuffer)) {
    if (fileExt === '.svg') {
      fs.writeFileSync(filePath, fileBuffer);

      log({
        type: 'warning',
        title: filePath,
        message: successMessage,
      });
    } else {
      log({
        title: filePath,
        message: 'File size increased. Skipped',
      });
    }
  } else {
    log({
      title: filePath,
      message: 'Nothing changed. Skipped',
    });
  }
}

function optimizeByType({ fileBuffer, fileExt, isLossless }) {
  switch (fileExt) {
    case '.jpg':
    case '.jpeg':
      return isLossless
        ? execBuffer({
          bin: guetzli,
          args: ['--quality', '90', execBuffer.input, execBuffer.output],
          input: fileBuffer,
        })
        : sharp(fileBuffer).jpeg({ quality: 80 }).toBuffer();

    case '.png':
      return execBuffer({
        bin: pngquant,
        args: ['--speed', '1', '--strip', '--output', execBuffer.output, execBuffer.input],
        input: fileBuffer,
      });

    case '.gif':
      return execBuffer({
        bin: gifsicle,
        args: ['--no-warnings', '--no-app-extensions', '--output', execBuffer.output, execBuffer.input],
        input: fileBuffer,
      });

    case '.svg':
      return new SVGO(svgoConfig).optimize(fileBuffer)
        .then(({ data: dataString }) => Buffer.from(dataString));

    default:
      throw new Error(`Unsupported file type: "${fileExt}"`);
  }
}

module.exports = optimize;
