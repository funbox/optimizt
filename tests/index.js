const assert = require('assert');
const fs = require('fs');
const path = require('path');

const copyRecursive = require('./utils/copyRecursive');
const removeRecursive = require('./utils/removeRecursive');

const optimizt = require('../');
const calcRatio = require('../lib/calcRatio');
const prepareFilePaths = require('../lib/prepareFilePaths');

const testDir = path.join(process.cwd(), 'tests');
const imagesDir = path.join(testDir, 'images');
const resultDir = path.join(testDir, 'result');

function assertRatio(filename, minRatio) {
  const originalSize = fs.statSync(path.join(imagesDir, filename)).size;
  const resultSize = fs.statSync(path.join(resultDir, filename)).size;

  if (calcRatio(originalSize, resultSize) > minRatio) {
    assert.fail(`Optimization ratio for "${filename}" is less than ${minRatio}%`);
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
    it('Paths for optimized files are generated correctly', () => {
      const filePaths = [
        'tests/images/ball.jpg',
        'tests/images/ball.png',
        'tests/images/homer.gif',
        'tests/images/SVG/fill-none.svg',
        'tests/images/SVG/optimized.svg',
        'tests/images/SVG/stroke-none.svg',
      ];
      const generatedFilePaths = prepareFilePaths([imagesDir], ['gif', 'jpeg', 'jpg', 'png', 'svg']);

      assert.deepStrictEqual(filePaths, generatedFilePaths);
    });

    it('Paths for WebP creation are generated correctly', () => {
      const filePaths = [
        'tests/images/ball.jpg',
        'tests/images/ball.png',
        'tests/images/homer.gif',
      ];
      const generatedFilePaths = prepareFilePaths([imagesDir], ['gif', 'jpeg', 'jpg', 'png']);

      assert.deepStrictEqual(filePaths, generatedFilePaths);
    });
  });

  describe('Optimization (lossy)', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('JPEG is optimized', () => {
      assertRatio('ball.jpg', -53);
    });

    it('PNG is optimized', () => {
      assertRatio('ball.png', -76);
    });

    it('GIF is optimized', () => {
      assertRatio('homer.gif', -7);
    });

    it('SVG is optimized', () => {
      assertRatio(path.join('SVG', 'fill-none.svg'), -2);
      assertRatio(path.join('SVG', 'stroke-none.svg'), -79);
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
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true, lossless: true });
    });

    after(() => {
      removeRecursive(resultDir);
    });

    it('JPEG is optimized', () => {
      assertRatio('ball.jpg', -46);
    });

    it('PNG is optimized', () => {
      assertRatio('ball.png', -76);
    });

    it('GIF is optimized', () => {
      assertRatio('homer.gif', -7);
    });

    it('SVG is optimized', () => {
      assertRatio('SVG/fill-none.svg', -2);
      assertRatio('SVG/stroke-none.svg', -79);
    });

    it('Optimized version is not saved when ratio is less than 1%', () => {
      const original = fs.readFileSync(path.join(imagesDir, 'SVG', 'optimized.svg'));
      const result = fs.readFileSync(path.join(resultDir, 'SVG', 'optimized.svg'));

      if (!original.equals(result)) {
        assert.fail('File "optimized.svg" has been changed');
      }
    });
  });

  describe('SVG optimization features', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true });
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

    it('fill="none" is not removed', () => {
      assertFileContainsSubstring(
        path.join('SVG', 'stroke-none.svg'),
        'stroke="none" d=',
      );
    });
  });

  describe('WebP creation (lossy)', () => {
    let generatedWebp;

    beforeEach(async function () {
      generatedWebp = null;

      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true, webp: true });
    });

    after(() => {
      generatedWebp = null;
      removeRecursive(resultDir);
    });

    it('WebP is created', async () => {
      const webpPath = path.join(resultDir, 'ball.webp');

      if (!fs.existsSync(webpPath)) {
        assert.fail('File "ball.webp" has not been created');
      }

      const jpgSize = fs.statSync(path.join(imagesDir, 'ball.jpg')).size;
      const webpSize = fs.statSync(webpPath).size;

      // Save generated WebP to check it for rewrite later
      generatedWebp = fs.readFileSync(webpPath);

      if (calcRatio(jpgSize, webpSize) > -70) {
        assert.fail('Optimization ratio for "ball.webp" is less than -70%');
      }
    });

    it('WebP is not created when ratio is less than 1%', () => {
      if (fs.existsSync(path.join(resultDir, 'homer.webp'))) {
        assert.fail('File "homer.webp" has been created');
      }
    });

    it('Existed WebP is not rewritten', () => {
      const webpPath = path.join(resultDir, 'ball.webp');

      if (generatedWebp && !fs.readFileSync(webpPath).equals(generatedWebp)) {
        assert.fail('File "ball.webp" has been rewritten');
      }
    });
  });

  describe('WebP creation (lossless)', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true, webp: true, lossless: true });
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
      const jpgSize = fs.statSync(path.join(imagesDir, 'ball.png')).size;
      const webpSize = fs.statSync(path.join(resultDir, 'ball.webp')).size;

      if (calcRatio(jpgSize, webpSize) > -42) {
        assert.fail('Optimization ratio for "ball.webp" is less than -42%');
      }
    });
  });
});
