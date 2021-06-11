const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CliProgress = require('cli-progress');
const execBuffer = require('exec-buffer');
const gifsicle = require('gifsicle');
const guetzli = require('guetzli');
const jpegoptim = require('jpegoptim-bin');
const pLimit = require('p-limit');
const pngquant = require('pngquant-bin');
const sharp = require('sharp');
const svgo = require('svgo');

const calcRatio = require('../lib/calcRatio');
const getImageFormat = require('../lib/getImageFormat');
const formatBytes = require('../lib/formatBytes');
const getPlural = require('../lib/getPlural');
const setSrgbColorspace = require('../lib/setSrgbColorspace');
const { log } = require('../lib/log');

const svgoConfig = require('../svgo/config');

async function optimize({ paths, lossless: isLossless }) {
  const totalPaths = paths.length;

  if (!totalPaths) return;

  log(`Optimizing ${totalPaths} ${getPlural(totalPaths, 'image', 'images')} (${isLossless ? 'lossless' : 'lossy'})...`);
  if (isLossless) log('Lossless optimization may take a long time');

  const progressBar = new CliProgress.SingleBar({
    format: `{bar} {percentage}% | Processed {value} of {total} ${getPlural(totalPaths, 'image', 'images')}`,
    clearOnComplete: true,
    stopOnComplete: true,
    hideCursor: true,
  }, CliProgress.Presets.shades_classic);

  progressBar.start(totalPaths, 0);

  const limit = pLimit(
    /*
      Guetzli uses a large amount of memory and a significant amount of CPU time.
      To reduce the processor load in lossless mode, we reduce the number
      of simultaneous tasks by half.
     */
    isLossless ? Math.round(os.cpus().length / 2) : os.cpus().length,
  );

  const tasksErrors = [];

  const tasks = paths.map(filePath => limit(() => fs.promises.readFile(filePath)
    .then(fileBuffer => optimizeByType({
      fileBuffer,
      filePath,
      isLossless,
    })))
    .then(fileBuffer => {
      progressBar.increment();
      return { fileBuffer, filePath };
    })
    .catch(error => {
      progressBar.increment();
      tasksErrors.push([filePath, {
        type: 'error',
        description: (error.message || '').trim(),
      }]);
    }));

  const tasksResult = await Promise.all(tasks);

  tasksResult.forEach(({ fileBuffer, filePath } = {}) => checkResult(fileBuffer, filePath));
  tasksErrors.forEach(error => log(...error));

  console.log();
  log('Done!', { type: 'success' });
}

function checkResult(fileBuffer, filePath) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

  const fileExt = path.extname(filePath).toLowerCase();
  const fileSizeBefore = fs.statSync(filePath).size;
  const fileSizeAfter = fileBuffer.length;
  const ratio = calcRatio(fileSizeBefore, fileSizeAfter);

  const successMessage = `
${formatBytes(fileSizeBefore)} → ${formatBytes(fileSizeAfter)}. \
Ratio: ${ratio}%`.trim();

  if (ratio > 0) {
    fs.writeFileSync(filePath, fileBuffer);

    log(filePath, {
      type: 'success',
      description: successMessage,
    });
  } else if (!fs.readFileSync(filePath).equals(fileBuffer)) {
    if (fileExt === '.svg') {
      fs.writeFileSync(filePath, fileBuffer);

      log(filePath, {
        type: 'warning',
        description: successMessage,
      });
    } else {
      log(filePath, {
        description: 'File size increased. Skipped',
        verboseOnly: true,
      });
    }
  } else {
    log(filePath, {
      description: 'Nothing changed. Skipped',
      verboseOnly: true,
    });
  }
}

async function optimizeByType({ fileBuffer, filePath, isLossless }) {
  const fileExt = path.extname(filePath).toLowerCase();
  const imageFormat = await getImageFormat(fileBuffer);

  switch (fileExt) {
    case '.jpg':
    case '.jpeg':
      if (imageFormat !== 'jpeg') {
        return fileBuffer;
      }

      return isLossless
        ? execBuffer({
          bin: guetzli,
          args: ['--quality', '90', execBuffer.input, execBuffer.output],
          input: await setSrgbColorspace(fileBuffer),
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

          child.on('error', error => {
            log(filePath, {
              type: 'error',
              description: error.message,
            });

            reject(error);
            process.exit(1);
          });

          child.on('exit', code => {
            if (code) {
              reject(new Error(`jpegoptim exited with status code: ${code}`));
            }

            resolve(Buffer.concat(buffers));
          });
        });

    case '.png':
      if (imageFormat !== 'png') {
        return fileBuffer;
      }

      return execBuffer({
        bin: pngquant,
        args: ['--speed', '1', '--strip', '--output', execBuffer.output, execBuffer.input],
        input: fileBuffer,
      });

    case '.gif':
      if (imageFormat !== 'gif') {
        return fileBuffer;
      }

      return execBuffer({
        bin: gifsicle,
        args: [
          ...isLossless ? [] : ['-O3', '--lossy=100'],
          '--no-warnings',
          '--output',
          execBuffer.output,
          execBuffer.input,
        ],
        input: fileBuffer,
      });

    case '.svg':
      if (imageFormat !== 'svg') {
        return fileBuffer;
      }

      return Buffer.from(svgo.optimize(fileBuffer, {
        ...svgoConfig,
      }).data);

    default:
      throw new Error(`Unsupported file type: "${fileExt}"`);
  }
}

module.exports = optimize;
