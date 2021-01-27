const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const execBuffer = require('exec-buffer');
const gifsicle = require('gifsicle');
const guetzli = require('guetzli');
const jpegoptim = require('jpegoptim-bin');
const pLimit = require('p-limit');
const pngquant = require('pngquant-bin');
const sharp = require('sharp');
const SVGO = require('svgo');

const calcRatio = require('../lib/calcRatio');
const getImageFormat = require('../lib/getImageFormat');
const formatBytes = require('../lib/formatBytes');
const getPlural = require('../lib/getPlural');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

const svgoConfig = require('../svgo/config');

async function optimize({ paths, lossless: isLossless }) {
  const totalPaths = paths.length;

  if (!totalPaths) return;

  spinner.start(`Optimizing ${totalPaths} ${getPlural(totalPaths, 'image', 'images')} (${isLossless ? 'lossless' : 'lossy'})...`);

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
    .then(fileBuffer => ({ fileBuffer, filePath }))
    .catch(error => {
      spinner.clear();
      log({
        type: 'error',
        title: filePath,
        message: error.message,
      });
    }));

  const tasksResult = await Promise.all(tasks);

  spinner.clear();
  tasksResult.forEach(({ fileBuffer, filePath } = {}) => checkResult(fileBuffer, filePath));

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
      if (getImageFormat(fileBuffer) !== 'jpeg') {
        return fileBuffer;
      }

      return isLossless
        ? execBuffer({
          bin: guetzli,
          args: ['--quality', '90', execBuffer.input, execBuffer.output],
          input: fileBuffer,
        })
        : new Promise((resolve, reject) => {
          const child = spawn(jpegoptim, [
            '--strip-all',
            '--strip-com',
            '--strip-exif',
            '--strip-iptc',
            '--strip-icc',
            '--strip-xmp',
            '--all-progressive',
            '--max=80',
            '--stdin',
            '--stdout',
          ]);
          const buffers = [];

          child.stdout.on('data', data => {
            buffers.push(data);
          });

          child.stdin.on('error', () => {
            child.kill();
            /*
              jpegoptim may crash on some files.
              When this happens, we process the file with another optimizer.
             */
            resolve(sharp(fileBuffer).jpeg({ quality: 80 }).toBuffer());
          });
          child.stdin.write(fileBuffer);
          child.stdin.end();

          child.on('close', code => {
            if (code) {
              reject(new Error(`jpegoptim exited with status code: ${code}`));
            }

            resolve(Buffer.concat(buffers));
          });
        });

    case '.png':
      if (getImageFormat(fileBuffer) !== 'png') {
        return fileBuffer;
      }

      return execBuffer({
        bin: pngquant,
        args: ['--speed', '1', '--strip', '--output', execBuffer.output, execBuffer.input],
        input: fileBuffer,
      });

    case '.gif':
      if (getImageFormat(fileBuffer) !== 'gif') {
        return fileBuffer;
      }

      return execBuffer({
        bin: gifsicle,
        args: ['--no-warnings', '--no-app-extensions', '--output', execBuffer.output, execBuffer.input],
        input: fileBuffer,
      });

    case '.svg':
      if (getImageFormat(fileBuffer) !== 'svg') {
        return fileBuffer;
      }

      return new SVGO(svgoConfig).optimize(fileBuffer)
        .then(({ data: dataString }) => Buffer.from(dataString));

    default:
      throw new Error(`Unsupported file type: "${fileExt}"`);
  }
}

module.exports = optimize;
