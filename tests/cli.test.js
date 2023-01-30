import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const cliPath = path.resolve('cli.js');
const imagesDir = path.resolve(dirname, 'images');

let tempDir = null;
let workDir = null;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimizt-test-'));
  workDir = `${tempDir}${path.sep}`;
  copyRecursive(imagesDir, tempDir);
});

afterEach(() => {
  if (tempDir) {
    fs.rmdirSync(tempDir, { recursive: true });
  }
});

describe('CLI', () => {
  describe('Optimization', () => {
    describe('Lossy', () => {
      test('SVG should be optimized', () => {
        const file = 'svg-not-optimized.svg';
        const stdout = runCliWithParams(`${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 80, minRatio: 75 });
      });

      test('JPEG/JPG should be optimized', () => {
        const file = 'jpeg-not-optimized.jpeg';
        const stdout = runCliWithParams(`${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 55, minRatio: 50 });
      });

      test('PNG should be optimized', () => {
        const file = 'png-not-optimized.png';
        const stdout = runCliWithParams(`${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 80, minRatio: 75 });
      });

      test('GIF should be optimized', () => {
        const file = 'gif-not-optimized.gif';
        const stdout = runCliWithParams(`${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 40, minRatio: 35 });
      });

      test('Files should not be optimized if ratio <= 0', () => {
        const stdout = runCliWithParams(`${workDir}svg-optimized.svg ${workDir}jpeg-one-pixel.jpg`);

        expectStringContains(stdout, 'Optimizing 2 images (lossy)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified('svg-optimized.svg');
        expectFileNotModified('jpeg-one-pixel.jpg');
      });

      test('Files in provided directory should be optimized', () => {
        const stdout = runCliWithParams(workDir);

        expectStringContains(stdout, 'Optimizing 8 images (lossy)...');
        expectTotalRatio({ maxRatio: 60, minRatio: 55, stdout });
      });
    });

    describe('Lossless (--lossless)', () => {
      test('JPEG/JPG should be optimized', () => {
        const file = 'jpeg-not-optimized.jpeg';
        const stdout = runCliWithParams(`--lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 50, minRatio: 45 });
      });

      test('PNG should be optimized', () => {
        const file = 'png-not-optimized.png';
        const stdout = runCliWithParams(`--lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 25, minRatio: 20 });
      });

      test('GIF should be optimized', () => {
        const file = 'gif-not-optimized.gif';
        const stdout = runCliWithParams(`--lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 10, minRatio: 5 });
      });

      test('Files should not be optimized if ratio <= 0', () => {
        const stdout = runCliWithParams(`--lossless ${workDir}jpeg-one-pixel.jpg`);

        expectStringContains(stdout, 'Optimizing 1 image (lossless)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified('jpeg-one-pixel.jpg');
      });

      test('Files in provided directory should be optimized', () => {
        const stdout = runCliWithParams(`--lossless ${workDir}`);

        expectStringContains(stdout, 'Optimizing 8 images (lossless)...');
        expectTotalRatio({ maxRatio: 25, minRatio: 15, stdout });
      });
    });
  });

  describe('SVGO', () => {
    test('Should containing “fill="none"”', () => {
      const fileBasename = 'svg-not-optimized';
      const stdout = runCliWithParams(`${workDir}${fileBasename}.svg`);

      expectStringContains(stdout, `${workDir}svg-not-optimized.svg`);

      const origBuffer = fs.readFileSync(path.join(imagesDir, `${fileBasename}.svg`));
      const modifiedBuffer = fs.readFileSync(path.join(tempDir, `${fileBasename}.svg`));
      const isBufferEquals = origBuffer.equals(modifiedBuffer);

      expect(isBufferEquals).toBeFalsy();
      expectStringContains(modifiedBuffer.toString(), 'fill="none"');
    });

    test('Should containing “stroke="none"”', () => {
      const fileBasename = 'svg-not-optimized';
      const stdout = runCliWithParams(`${workDir}${fileBasename}.svg`);

      expectStringContains(stdout, `${workDir}svg-not-optimized.svg`);

      const origBuffer = fs.readFileSync(path.join(imagesDir, `${fileBasename}.svg`));
      const modifiedBuffer = fs.readFileSync(path.join(tempDir, `${fileBasename}.svg`));
      const isBufferEquals = origBuffer.equals(modifiedBuffer);

      expect(isBufferEquals).toBeFalsy();
      expectStringContains(modifiedBuffer.toString(), 'stroke="none"');
    });
  });

  describe('Converting to AVIF (--avif)', () => {
    describe('Lossy', () => {
      test('JPEG should be converted', () => {
        const file = 'jpeg-not-optimized.jpeg';
        const stdout = runCliWithParams(`--avif ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 90, minRatio: 85, outputExt: 'avif' });
        expectFileNotModified(file);
      });

      test('PNG should be converted', () => {
        const file = 'png-not-optimized.png';
        const stdout = runCliWithParams(`--avif ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 95, minRatio: 90, outputExt: 'avif' });
        expectFileNotModified(file);
      });

      test('GIF should be converted', () => {
        const file = 'gif-not-optimized.gif';
        const stdout = runCliWithParams(`--avif ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 95, minRatio: 90, outputExt: 'avif' });
        expectFileNotModified(file);
      });

      test('Files should not be converted if ratio <= 0', () => {
        const fileBasename = 'jpeg-one-pixel';
        const stdout = runCliWithParams(`--avif ${workDir}${fileBasename}.jpg`);

        expectStringContains(stdout, 'Converting 1 image (lossy)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified(`${fileBasename}.jpg`);
        expectFileNotExists(`${fileBasename}.avif`);
      });

      test('Files in provided directory should be converted', () => {
        const fileBasename = 'png-not-optimized';
        const stdout = runCliWithParams(`--avif ${workDir}`);
        const stdoutRatio = grepTotalRatio(stdout);

        expectStringContains(stdout, 'Converting 6 images (lossy)...');
        expectRatio(stdoutRatio, 85, 95);
        expectFileNotModified(`${fileBasename}.png`);
        expectFileExists(`${fileBasename}.avif`);
      });
    });

    describe('Lossless (--lossless)', () => {
      // TODO: In lossless mode JPEG file size is always smaller than AVIF
      // test('JPEG should be converted', () => {});

      test('PNG should be converted', () => {
        const file = 'png-not-optimized.png';
        const stdout = runCliWithParams(`--avif --lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 40, minRatio: 35, outputExt: 'avif' });
        expectFileNotModified(file);
      });

      test('GIF should be converted', () => {
        const file = 'gif-not-optimized.gif';
        const stdout = runCliWithParams(`--avif --lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 75, minRatio: 70, outputExt: 'avif' });
        expectFileNotModified(file);
      });

      test('Files should not be converted if ratio <= 0', () => {
        const fileBasename = 'jpeg-one-pixel';
        const stdout = runCliWithParams(`--avif --lossless ${workDir}${fileBasename}.jpg`);

        expectStringContains(stdout, 'Converting 1 image (lossless)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified(`${fileBasename}.jpg`);
        expectFileNotExists(`${fileBasename}.avif`);
      });

      test('Files in provided directory should be converted', () => {
        const fileBasename = 'png-not-optimized';
        const stdout = runCliWithParams(`--avif --lossless ${workDir}`);
        const stdoutRatio = grepTotalRatio(stdout);

        expectStringContains(stdout, 'Converting 6 images (lossless)...');
        expectRatio(stdoutRatio, 45, 50);
        expectFileNotModified(`${fileBasename}.png`);
        expectFileExists(`${fileBasename}.avif`);
      });
    });
  });

  describe('Converting to WebP (--webp)', () => {
    describe('Lossy', () => {
      test('JPEG should be converted', () => {
        const file = 'jpeg-not-optimized.jpeg';
        const stdout = runCliWithParams(`--webp ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 75, minRatio: 70, outputExt: 'webp' });
        expectFileNotModified(file);
      });

      test('PNG should be converted', () => {
        const file = 'png-not-optimized.png';
        const stdout = runCliWithParams(`--webp ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 85, minRatio: 80, outputExt: 'webp' });
        expectFileNotModified(file);
      });

      test('GIF should be converted', () => {
        const file = 'gif-not-optimized.gif';
        const stdout = runCliWithParams(`--webp ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 40, minRatio: 35, outputExt: 'webp' });
        expectFileNotModified(file);
      });

      test('Files should not be converted if ratio <= 0', () => {
        const fileBasename = 'jpeg-low-quality';
        const stdout = runCliWithParams(`--webp ${workDir}${fileBasename}.jpg`);

        expectStringContains(stdout, 'Converting 1 image (lossy)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified(`${fileBasename}.jpg`);
        expectFileNotExists(`${fileBasename}.webp`);
      });

      test('Files in provided directory should be converted', () => {
        const fileBasename = 'png-not-optimized';
        const stdout = runCliWithParams(`--webp ${workDir}`);
        const stdoutRatio = grepTotalRatio(stdout);

        expectStringContains(stdout, 'Converting 6 images (lossy)...');
        expectRatio(stdoutRatio, 55, 60);
        expectFileNotModified(`${fileBasename}.png`);
        expectFileExists(`${fileBasename}.webp`);
      });
    });

    describe('Lossless (--lossless)', () => {
      test('JPEG should be converted', () => {
        const file = 'jpeg-one-pixel.jpg';
        const stdout = runCliWithParams(`--webp --lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 80, minRatio: 75, outputExt: 'webp' });
        expectFileNotModified(file);
      });

      test('PNG should be converted', () => {
        const file = 'png-not-optimized.png';
        const stdout = runCliWithParams(`--webp --lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 45, minRatio: 40, outputExt: 'webp' });
        expectFileNotModified(file);
      });

      test('GIF should be converted', () => {
        const file = 'gif-not-optimized.gif';
        const stdout = runCliWithParams(`--webp --lossless ${workDir}${file}`);

        expectFileRatio({ stdout, file, maxRatio: 25, minRatio: 20, outputExt: 'webp' });
        expectFileNotModified(file);
      });

      test('Files should not be converted if ratio <= 0', () => {
        const fileBasename = 'jpeg-low-quality';
        const stdout = runCliWithParams(`--webp --lossless ${workDir}${fileBasename}.jpg`);

        expectStringContains(stdout, 'Converting 1 image (lossless)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified(`${fileBasename}.jpg`);
        expectFileNotExists(`${fileBasename}.webp`);
      });

      test('Files in provided directory should be converted', () => {
        const fileBasename = 'png-not-optimized';
        const stdout = runCliWithParams(`--webp --lossless ${workDir}`);
        const stdoutRatio = grepTotalRatio(stdout);

        expectStringContains(stdout, 'Converting 6 images (lossless)...');
        expectRatio(stdoutRatio, 30, 35);
        expectFileNotModified(`${fileBasename}.png`);
        expectFileExists(`${fileBasename}.webp`);
      });
    });
  });

  describe('Converting to AVIF and WebP at the same time (--avif --webp)', () => {
    describe('Lossy', () => {
      test('AVIF and WebP should be created', () => {
        const fileBasename = 'png-not-optimized';
        const stdout = runCliWithParams(`--avif --webp ${workDir}${fileBasename}.png`);
        const stdoutRatio = grepTotalRatio(stdout);

        expectStringContains(stdout, 'Converting 1 image (lossy)...');
        expectStringContains(stdout, path.join(tempDir, `${fileBasename}.png`));
        expectRatio(stdoutRatio, 85, 90);
        expectFileNotModified(`${fileBasename}.png`);
        expectFileExists(`${fileBasename}.avif`);
        expectFileExists(`${fileBasename}.webp`);
      });

      test('AVIF and WebP should not be created if ratio <= 0', () => {
        const stdout = runCliWithParams(`--avif --webp ${workDir}jpeg-low-quality.jpg ${workDir}jpeg-one-pixel.jpg`);

        expectStringContains(stdout, 'Converting 2 images (lossy)...');
        expectFileNotModified('jpeg-low-quality.jpg');
        expectFileNotExists('jpeg-low-quality.webp');
        expectFileNotModified('jpeg-one-pixel.jpg');
        expectFileNotExists('jpeg-one-pixel.avif');
      });
    });

    describe('Lossless (--lossless)', () => {
      test('AVIF and WebP should be created', () => {
        const fileBasename = 'png-not-optimized';
        const stdout = runCliWithParams(`--avif --webp --lossless ${workDir}${fileBasename}.png`);
        const stdoutRatio = grepTotalRatio(stdout);

        expectStringContains(stdout, 'Converting 1 image (lossless)...');
        expectStringContains(stdout, path.join(tempDir, `${fileBasename}.png`));
        expectRatio(stdoutRatio, 40, 45);
        expectFileNotModified(`${fileBasename}.png`);
        expectFileExists(`${fileBasename}.avif`);
        expectFileExists(`${fileBasename}.webp`);
      });

      test('AVIF and WebP should not be created if ratio <= 0', () => {
        const fileBasename = 'jpeg-low-quality';
        const stdout = runCliWithParams(`--avif --webp --lossless ${workDir}${fileBasename}.jpg`);

        expectStringContains(stdout, 'Converting 1 image (lossless)...');
        expectStringContains(stdout, 'Done!');
        expectFileNotModified(`${fileBasename}.jpg`);
        expectFileNotExists(`${fileBasename}.avif`);
        expectFileNotExists(`${fileBasename}.webp`);
      });
    });
  });

  describe('Force rewrite AVIF or WebP (--force)', () => {
    test('Should not be overwritten', () => {
      const fileBasename = 'png-not-optimized';
      const params = `--avif --webp ${workDir}${fileBasename}.png`;

      runCliWithParams(params);
      const stdout = runCliWithParams(params);

      expectStringContains(stdout, `File already exists, '${workDir}${fileBasename}.avif'`);
      expectStringContains(stdout, `File already exists, '${workDir}${fileBasename}.webp'`);
    });

    test('Should be overwritten', () => {
      const fileBasename = 'png-not-optimized';
      const params = `--avif --webp --force ${workDir}${fileBasename}.png`;

      runCliWithParams(params);
      const stdout = runCliWithParams(params);

      expectStringNotContains(stdout, `File already exists, '${workDir}${fileBasename}.avif'`);
      expectStringNotContains(stdout, `File already exists, '${workDir}${fileBasename}.webp'`);
    });
  });

  describe('Output to provided directory (--output)', () => {
    let outputDir = null;

    beforeEach(() => {
      outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimizt-test-'));
    });

    afterEach(() => {
      if (outputDir) {
        fs.rmdirSync(outputDir, { recursive: true });
      }
    });

    describe('Optimization', () => {
      test('Should output one file', () => {
        const fileName = 'png-not-optimized.png';

        runCliWithParams(`--output ${outputDir} ${workDir}${fileName}`);
        expect(fs.existsSync(path.join(outputDir, workDir, fileName))).toBeTruthy();
      });

      test('Should output list of files', () => {
        runCliWithParams(`--output ${outputDir} ${workDir}*.jpg ${workDir}*.jpeg`);
        expect(fs.existsSync(path.join(outputDir, workDir, 'jpeg-low-quality.jpg'))).toBeTruthy();
        expect(fs.existsSync(path.join(outputDir, workDir, 'jpeg-not-optimized.jpeg'))).toBeTruthy();
      });
    });

    describe('Converting', () => {
      test('Should output one file', () => {
        const fileBasename = 'png-not-optimized';

        runCliWithParams(`--avif --output ${outputDir} ${workDir}${fileBasename}.png`);
        expect(fs.existsSync(path.join(outputDir, workDir, `${fileBasename}.avif`))).toBeTruthy();
      });

      test('Should output list of files', () => {
        runCliWithParams(`--avif --output ${outputDir} ${workDir}*.jpg ${workDir}*.jpeg`);
        expect(fs.existsSync(path.join(outputDir, workDir, 'jpeg-low-quality.avif'))).toBeTruthy();
        expect(fs.existsSync(path.join(outputDir, workDir, 'jpeg-not-optimized.avif'))).toBeTruthy();
      });
    });
  });

  describe('Verbose mode (--verbose)', () => {
    describe('Optimization', () => {
      test('Should be verbose', () => {
        const stdout = runCliWithParams(`--verbose ${workDir}svg-optimized.svg`);
        expectStringContains(stdout, 'Nothing changed. Skipped');
      });

      test('Should not be verbose', () => {
        const stdout = runCliWithParams(`${workDir}svg-optimized.svg`);
        expectStringNotContains(stdout, 'Nothing changed. Skipped');
      });
    });

    describe('Converting', () => {
      test('Should be verbose', () => {
        const stdout = runCliWithParams(`--verbose --avif ${workDir}jpeg-one-pixel.jpg`);
        expectStringContains(stdout, 'File size increased. Conversion to AVIF skipped');
      });

      test('Should not be verbose', () => {
        const stdout = runCliWithParams(`--avif ${workDir}jpeg-one-pixel.jpg`);
        expectStringNotContains(stdout, 'File size increased. Conversion to AVIF skipped');
      });
    });
  });

  describe('Help (--help)', () => {
    const helpString = `\
Usage: cli [options] <dir> <file ...>

CLI image optimization tool

Options:
  --avif               create AVIF and exit
  --webp               create WebP and exit
  -f, --force          force create AVIF and WebP
  -l, --lossless       perform lossless optimizations
  -v, --verbose        be verbose
  -c, --config <path>  use this configuration, overriding default config
                       options if present
  -o, --output <path>  write output to directory
  -V, --version        output the version number
  -h, --help           display help for command
`;

    test('Should be printed', () => {
      const stdout = runCliWithParams('--help');
      expect(stdout).toBe(helpString);
    });

    test('Should be printed if no CLI params provided', () => {
      const stdout = runCliWithParams('');
      expect(stdout).toBe(helpString);
    });
  });
});

function copyRecursive(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to);

  fs.readdirSync(from, { withFileTypes: true }).forEach(item => {
    const fromPath = path.join(from, item.name);
    const toPath = path.join(to, item.name);

    if (item.isDirectory()) {
      copyRecursive(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

function calculateDirectorySize(directoryPath) {
  let totalSize = null;

  fs.readdirSync(directoryPath, { withFileTypes: true }).forEach(item => {
    const itemPath = path.join(directoryPath, item.name);

    if (item.isDirectory()) {
      calculateDirectorySize(itemPath);
      return;
    }

    totalSize += fs.statSync(itemPath).size;
  });

  return totalSize;
}

function calcRatio(from, to) {
  return Math.round((from - to) / from * 100);
}

function runCliWithParams(params) {
  return execSync(`node ${cliPath} ${params}`).toString();
}

function grepTotalRatio(string) {
  const [, ratio] = new RegExp(/You\ssaved\s.+\((\d{1,3})%\)/).exec(string);
  return parseInt(ratio, 10);
}

function expectStringContains(string, containing) {
  expect(string).toEqual(expect.stringContaining(containing));
}

function expectStringNotContains(string, containing) {
  expect(string).toEqual(expect.not.stringContaining(containing));
}

function expectRatio(current, min, max) {
  expect(current).toBeGreaterThanOrEqual(min);
  expect(current).toBeLessThanOrEqual(max);
}

function expectFileRatio({ file, maxRatio, minRatio, stdout, outputExt }) {
  expectStringContains(stdout, path.join(tempDir, file));

  const fileBasename = path.basename(file, path.extname(file));
  const outputFile = outputExt ? `${fileBasename}.${outputExt}` : file;

  const sizeBefore = fs.statSync(path.join(imagesDir, file)).size;
  const sizeAfter = fs.statSync(path.join(tempDir, outputFile)).size;

  const calculatedRatio = calcRatio(sizeBefore, sizeAfter);
  const stdoutRatio = grepTotalRatio(stdout);

  expect(stdoutRatio).toBe(calculatedRatio);
  expectRatio(stdoutRatio, minRatio, maxRatio);
}

function expectTotalRatio({ maxRatio, minRatio, stdout }) {
  const sizeBefore = calculateDirectorySize(imagesDir);
  const sizeAfter = calculateDirectorySize(tempDir);
  const calculatedRatio = calcRatio(sizeBefore, sizeAfter);
  const stdoutRatio = grepTotalRatio(stdout);

  expect(stdoutRatio).toBe(calculatedRatio);
  expectRatio(stdoutRatio, minRatio, maxRatio);
}

function expectFileNotModified(fileName) {
  const origImageBuffer = fs.readFileSync(path.join(imagesDir, fileName));
  const tempImageBuffer = fs.readFileSync(path.join(tempDir, fileName));

  expect(tempImageBuffer.equals(origImageBuffer)).toBe(true);
}

function expectFileExists(fileName) {
  const isFileExists = fs.existsSync(path.join(tempDir, fileName));
  expect(isFileExists).toBe(true);
}

function expectFileNotExists(fileName) {
  const isFileExists = fs.existsSync(path.join(tempDir, fileName));
  expect(isFileExists).not.toBe(true);
}
