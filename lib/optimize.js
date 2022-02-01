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
const sharp = require('sharp');
const svgo = require('svgo');

const calcRatio = require('./calcRatio');
const formatBytes = require('./formatBytes');
const getImageFormat = require('./getImageFormat');
const getPlural = require('./getPlural');
const prepareWriteFilePath = require('./prepareWriteFilePath');
const setSrgbColorspace = require('./setSrgbColorspace');
const { log } = require('./log');
const showTotal = require('./showTotal');

const svgoConfig = require('../svgo/config');

async function optimize({ paths, lossless: isLossless, output: outputDir }) {
  const totalPaths = paths.length;

  if (!totalPaths) return;

  log(`Optimizing ${totalPaths} ${getPlural(totalPaths, 'image', 'images')} (${isLossless ? 'lossless' : 'lossy'})...`);
  if (isLossless) log('Lossless optimization may take a long time');

  const progressBar = new CliProgress.SingleBar({
    format: `{bar} {percentage}% | Processed {value} of {total} ${getPlural(totalPaths, 'image', 'images')}`,
    clearOnComplete: true,
    stopOnComplete: true,
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

  const totalSize = { before: 0, after: 0 };
  const tasksResult = await Promise.all(tasks);

  tasksResult
    .filter(Boolean)
    .forEach(({ fileBuffer, filePath } = {}) => {
      const fileSize = {
        before: fs.statSync(filePath).size,
        after: fileBuffer.length,
      };

      totalSize.before += fileSize.before;
      totalSize.after += fileSize.after;

      checkResult(fileBuffer, filePath, fileSize, outputDir);
    });

  tasksErrors.forEach(error => log(...error));

  console.log();
  showTotal(totalSize.before, totalSize.after);
}

function checkResult(fileBuffer, filePath, fileSize, outputDir) {
  if (!Buffer.isBuffer(fileBuffer) || typeof filePath !== 'string') return;

  const fileExt = path.extname(filePath).toLowerCase();
  const before = formatBytes(fileSize.before);
  const after = formatBytes(fileSize.after);
  const ratio = calcRatio(fileSize.before, fileSize.after);
  const successMessage = `${before} → ${after}. Ratio: ${ratio}%`;

  const writeFilePath = prepareWriteFilePath(filePath, outputDir);

  const isChanged = !fs.readFileSync(filePath).equals(fileBuffer);
  const isOptimized = ratio > 0;
  const isSvg = fileExt === '.svg';

  if (isOptimized || (isChanged && isSvg)) {
    try {
      fs.writeFileSync(writeFilePath, fileBuffer);

      log(filePath, {
        type: !isOptimized ? 'warning' : 'success',
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
      description: `${(isChanged ? 'File size increased' : 'Nothing changed')}. Skipped`,
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

          child.on('close', () => {
            resolve(Buffer.concat(buffers));
          });

          child.on('exit', code => {
            if (code) {
              reject(new Error(`jpegoptim exited with status code: ${code}`));
            }
          });
        });

    case '.png':
      if (imageFormat !== 'png') {
        return fileBuffer;
      }

      return sharp(fileBuffer)
        .png({
          compressionLevel: 9,
          adaptiveFiltering: isLossless,
          palette: !isLossless,
        })
        .toBuffer();

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
