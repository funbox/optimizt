const assert = require('assert');
const fs = require('fs');
const path = require('path');

const copyRecursive = require('./utils/copyRecursive');
const removeRecursive = require('./utils/removeRecursive');

const optimizt = require('../');
const calcRatio = require('../lib/calcRatio');
const prepareFilePaths = require('../lib/prepareFilePaths');

const testsDir = path.join(process.cwd(), 'tests');
const imagesDir = path.join(testsDir, 'images');
const resultDir = path.join(testsDir, 'result');

function assertRatio(filename, minRatio, maxRatio) {
  const originalSize = fs.statSync(path.join(imagesDir, filename)).size;
  const resultSize = fs.statSync(path.join(resultDir, filename)).size;
  const ratio = calcRatio(originalSize, resultSize);

  if (ratio < minRatio) {
    assert.fail(`Optimization ratio for "${filename}" is less than ${minRatio}%`);
  }

  if (typeof maxRatio !== 'undefined' && ratio > maxRatio) {
    assert.fail(`Optimization ratio for "${filename}" is more than ${maxRatio}%`);
  }
}

function assertFileContainsSubstring(filename, string) {
  const isContains = fs.readFileSync(path.join(resultDir, filename))
    .toString()
    .includes(string);

  if (!isContains) {
    assert.fail(`File "${filename}" does not contain the string '${string}'`);
  }
}

describe('CLI', () => {
  describe('Paths generation', () => {
    it('Paths for "optimize" action are generated correctly', () => {
      const filePaths = [
        'tests/images/ball.jpg',
        'tests/images/ball.png',
        'tests/images/homer-low.jpg',
        'tests/images/homer.gif',
        'tests/images/pixel.jpg',
        'tests/images/SVG/fill-none.svg',
        'tests/images/SVG/optimized.svg',
        'tests/images/SVG/stroke-none.svg',
      ];
      const generatedFilePaths = prepareFilePaths([imagesDir], ['gif', 'jpeg', 'jpg', 'png', 'svg']);

      assert.deepStrictEqual(filePaths, generatedFilePaths);
    });

    it('Paths for "convert" action are generated correctly', () => {
      const filePaths = [
        'tests/images/ball.jpg',
        'tests/images/ball.png',
        'tests/images/homer-low.jpg',
        'tests/images/homer.gif',
        'tests/images/pixel.jpg',
      ];
      const generatedFilePaths = prepareFilePaths([imagesDir], ['gif', 'jpeg', 'jpg', 'png']);

      assert.deepStrictEqual(filePaths, generatedFilePaths);
    });
  });

  describe('Optimization (lossy)', () => {
    before(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({
        paths: [resultDir],
        verbose: true,
      });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('JPEG is optimized', () => {
      assertRatio('ball.jpg', 53);
    });

    it('PNG is optimized', () => {
      assertRatio('ball.png', 76);
    });

    it('GIF is optimized', () => {
      assertRatio('homer.gif', 7);
    });

    it('SVG is optimized', () => {
      assertRatio(path.join('SVG', 'fill-none.svg'), 2);
      assertRatio(path.join('SVG', 'stroke-none.svg'), 79);
    });

    it('Optimized version is not saved when ratio is less than 1%', () => {
      const original = fs.readFileSync(path.join(imagesDir, 'SVG', 'optimized.svg'));
      const result = fs.readFileSync(path.join(resultDir, 'SVG', 'optimized.svg'));

      if (!original.equals(result)) {
        assert.fail('File "optimized.svg" has been changed');
      }
    });
  });

  describe('Optimization (lossless)', () => {
    before(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({
        paths: [path.join(resultDir, 'ball.jpg')],
        verbose: true,
        lossless: true,
      });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('JPEG is optimized', () => {
      assertRatio('ball.jpg', 46, 46);
    });
  });

  describe('SVG optimization features', () => {
    before(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({
        paths: [resultDir],
        verbose: true,
      });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('fill="none" is not removed', () => {
      assertFileContainsSubstring(
        path.join('SVG', 'fill-none.svg'),
        '<path fill="none"',
      );
    });

    it('stroke="none" is not removed', () => {
      assertFileContainsSubstring(
        path.join('SVG', 'stroke-none.svg'),
        'stroke="none" d=',
      );
    });
  });

  describe('WebP creation (lossy)', () => {
    const testImagePath = path.join(resultDir, 'ball.webp');
    let testImageBuffer;

    beforeEach(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
    });

    after(() => {
      testImageBuffer = null;
      removeRecursive(resultDir);
    });

    it('WebP is created', async () => {
      await optimizt({
        paths: [path.join(resultDir, 'ball.jpg')],
        verbose: true,
        webp: true,
      });

      if (!fs.existsSync(testImagePath)) {
        assert.fail('File "ball.webp" has not been created');
      }

      const originalImageSize = fs.statSync(path.join(imagesDir, 'ball.jpg')).size;
      const outputImageSize = fs.statSync(testImagePath).size;

      // Save converted image to check it for rewrite later
      testImageBuffer = fs.readFileSync(testImagePath);

      if (calcRatio(originalImageSize, outputImageSize) < 70) {
        assert.fail('Optimization ratio for "ball.webp" is less than 70%');
      }
    });

    it('Existed WebP is not rewritten', async () => {
      await optimizt({
        paths: [
          path.join(resultDir, 'ball.jpg'),
          path.join(resultDir, 'ball.png'),
        ],
        verbose: true,
        webp: true,
      });

      if (testImageBuffer && !fs.readFileSync(testImagePath).equals(testImageBuffer)) {
        assert.fail('File "ball.webp" has been rewritten');
      }
    });

    it('WebP is not created when ratio is less than 1%', async () => {
      await optimizt({
        paths: [path.join(resultDir, 'homer-low.jpg')],
        verbose: true,
        webp: true,
      });

      if (fs.existsSync(path.join(resultDir, 'homer-low.webp'))) {
        assert.fail('File "homer-low.webp" has been created');
      }
    });
  });

  describe('WebP creation (lossless)', () => {
    before(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({
        paths: [path.join(resultDir, 'ball.png')],
        verbose: true,
        lossless: true,
        webp: true,
      });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('WebP is created', async () => {
      if (!fs.existsSync(path.join(resultDir, 'ball.webp'))) {
        assert.fail('File "ball.webp" has not been created');
      }
    });

    it('WebP is optimized', async () => {
      const originalImageSize = fs.statSync(path.join(imagesDir, 'ball.png')).size;
      const outputImageSize = fs.statSync(path.join(resultDir, 'ball.webp')).size;
      const ratio = calcRatio(originalImageSize, outputImageSize);

      if (ratio < 42) {
        assert.fail('Optimization ratio for "ball.webp" is less than 42%');
      }

      if (ratio > 43) {
        assert.fail('Optimization ratio for "ball.webp" is more than 43%');
      }
    });
  });

  describe('AVIF creation (lossy)', () => {
    const testImagePath = path.join(resultDir, 'ball.avif');
    let testImageBuffer;

    beforeEach(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
    });

    after(() => {
      testImageBuffer = null;
      removeRecursive(resultDir);
    });

    it('AVIF is created', async () => {
      await optimizt({
        paths: [path.join(resultDir, 'ball.jpg')],
        verbose: true,
        avif: true,
      });

      if (!fs.existsSync(testImagePath)) {
        assert.fail('File "ball.avif" has not been created');
      }

      const originalImageSize = fs.statSync(path.join(imagesDir, 'ball.jpg')).size;
      const outputImageSize = fs.statSync(testImagePath).size;

      // Save converted image to check it for rewrite later
      testImageBuffer = fs.readFileSync(testImagePath);

      if (calcRatio(originalImageSize, outputImageSize) < 88) {
        assert.fail('Optimization ratio for "ball.avif" is less than 88%');
      }
    });

    it('Existed AVIF is not rewritten', async () => {
      await optimizt({
        paths: [
          path.join(resultDir, 'ball.jpg'),
          path.join(resultDir, 'ball.png'),
        ],
        verbose: true,
        avif: true,
      });

      if (testImageBuffer && !fs.readFileSync(testImagePath).equals(testImageBuffer)) {
        assert.fail('File "ball.avif" has been rewritten');
      }
    });

    it('AVIF is not created when ratio is less than 1%', () => {
      if (fs.existsSync(path.join(resultDir, 'pixel.avif'))) {
        assert.fail('File "pixel.avif" has been created');
      }
    });
  });

  describe('AVIF creation (lossless)', () => {
    before(async function prepare() {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({
        paths: [path.join(resultDir, 'ball.png')],
        verbose: true,
        lossless: true,
        avif: true,
      });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('AVIF is created', async () => {
      if (!fs.existsSync(path.join(resultDir, 'ball.avif'))) {
        assert.fail('File "ball.avif" has not been created');
      }
    });

    it('AVIF is optimized', async () => {
      const originalImageSize = fs.statSync(path.join(imagesDir, 'ball.png')).size;
      const outputImageSize = fs.statSync(path.join(resultDir, 'ball.avif')).size;
      const ratio = calcRatio(originalImageSize, outputImageSize);

      if (ratio !== 40) {
        assert.fail('Optimization ratio for "ball.avif" is not equal 40%');
      }
    });
  });
});
