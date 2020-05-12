const assert = require('assert');
const fs = require('fs');
const path = require('path');

const copyRecursive = require('./utils/copyRecursive');
const removeRecursive = require('./utils/removeRecursive');

const calcRatio = require('../lib/calcRatio');
const optimizt = require('../');

const testDir = path.join(process.cwd(), 'tests');
const imagesDir = path.join(testDir, 'images');
const resultDir = path.join(testDir, 'result');

let webp;

function checkRatio(filename, minRatio) {
  const originalSize = fs.statSync(path.join(imagesDir, filename)).size;
  const resultSize = fs.statSync(path.join(resultDir, filename)).size;

  if (calcRatio(originalSize, resultSize) > minRatio) {
    assert.fail(`Optimization ratio for "${filename}" is less than ${minRatio}%`);
  }
}

function checkForString(filename, string) {
  const isContains = fs.readFileSync(path.join(resultDir, filename))
    .toString()
    .includes(string);

  if (!isContains) {
    assert.fail(`File "${filename}" does not contain the string '${string}'`);
  }
}

describe('CLI', () => {
  describe('Paths building', () => {
  });

  describe('Optimization', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true });
    });

    it('JPEG is optimized', () => {
      checkRatio('ball.jpg', -53);
    });

    it('PNG is optimized', () => {
      checkRatio('ball.png', -77);
    });

    it('GIF is optimized', () => {
      checkRatio('homer.gif', -7);
    });

    it('SVG is optimized', () => {
      checkRatio(path.join('SVG', 'fill-none.svg'), -2);
      checkRatio(path.join('SVG', 'stroke-none.svg'), -79);
    });

    it('Optimized version is not saved when ratio is less than 1%', () => {
      const original = fs.readFileSync(path.join(imagesDir, 'SVG', 'optimized.svg'));
      const result = fs.readFileSync(path.join(resultDir, 'SVG', 'optimized.svg'));

      if (!original.equals(result)) {
        assert.fail('File "optimized.svg" has been changed');
      }
    });

    after(() => {
      removeRecursive(resultDir);
    });
  });

  describe('Optimization (lossless)', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true, lossless: true });
    });

    it('JPEG is optimized', () => {
      checkRatio('ball.jpg', -46);
    });

    it('PNG is optimized', () => {
      checkRatio('ball.png', -77);
    });

    it('GIF is optimized', () => {
      checkRatio('homer.gif', -7);
    });

    it('SVG is optimized', () => {
      checkRatio('SVG/fill-none.svg', -2);
      checkRatio('SVG/stroke-none.svg', -79);
    });

    it('Optimized version is not saved when ratio is less than 1%', () => {
      const original = fs.readFileSync(path.join(imagesDir, 'SVG', 'optimized.svg'));
      const result = fs.readFileSync(path.join(resultDir, 'SVG', 'optimized.svg'));

      if (!original.equals(result)) {
        assert.fail('File "optimized.svg" has been changed');
      }
    });

    after(() => {
      removeRecursive(resultDir);
    });
  });

  describe('SVG optimization features', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true });
    });

    it('fill="none" is not removed', () => {
      checkForString(
        path.join('SVG', 'fill-none.svg'),
        '<path fill="none"',
      );
    });

    it('fill="none" is not removed', () => {
      checkForString(
        path.join('SVG', 'stroke-none.svg'),
        'stroke="none" d=',
      );
    });

    after(() => {
      removeRecursive(resultDir);
    });
  });

  describe('WebP creation', () => {
    before(async function () {
      webp = null;

      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true, webp: true });
    });

    it('WebP is created', async () => {
      const webpPath = path.join(resultDir, 'ball.webp');

      if (!fs.existsSync(webpPath)) assert.fail('File "ball.webp" has not been created');

      const jpgSize = fs.statSync(path.join(imagesDir, 'ball.jpg')).size;
      const webpSize = fs.statSync(webpPath).size;

      webp = fs.readFileSync(webpPath);

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

      if (!fs.existsSync(webpPath)) assert.fail('File "ball.webp" has not been created');

      if (webp && !fs.readFileSync(webpPath).equals(webp)) {
        assert.fail('File "ball.webp" has been rewritten');
      }
    });

    after(() => {
      webp = null;
      removeRecursive(resultDir);
    });
  });

  describe('WebP creation (lossless)', () => {
    before(async function () {
      removeRecursive(resultDir);
      copyRecursive(imagesDir, resultDir);

      this.timeout(60000);
      await optimizt({ paths: [resultDir], verbose: true, webp: true, lossless: true });
    });

    it('WebP is created', async () => {
      const webpPath = path.join(resultDir, 'ball.webp');

      if (!fs.existsSync(webpPath)) assert.fail('File "ball.webp" has not been created');

      const jpgSize = fs.statSync(path.join(imagesDir, 'ball.png')).size;
      const webpSize = fs.statSync(webpPath).size;

      webp = fs.readFileSync(webpPath);

      if (calcRatio(jpgSize, webpSize) > -42) {
        assert.fail('Optimization ratio for "ball.webp" is less than -42%');
      }
    });

    after(() => {
      removeRecursive(resultDir);
    });
  });
});
