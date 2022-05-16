import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import getImageFormat from '../lib/getImageFormat.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function readFile(filePath) {
  return fs.readFileSync(path.resolve(dirname, filePath));
}

const gifBuffer = readFile('images/gif-not-optimized.gif');
const jpegBuffer = readFile('images/jpeg-one-pixel.jpg');
const pngBuffer = readFile('images/png-not-optimized.png');
const svgBuffer = readFile('images/svg-optimized.svg');

test('GIF should be detected as “gif”', async () => {
  await expect(getImageFormat(gifBuffer)).resolves.toBe('gif');
});

test('JPEG should be detected as “jpeg”', async () => {
  await expect(getImageFormat(jpegBuffer)).resolves.toBe('jpeg');
});

test('PNG should be detected as “png”', async () => {
  await expect(getImageFormat(pngBuffer)).resolves.toBe('png');
});

test('SVG should be detected as “svg”', async () => {
  await expect(getImageFormat(svgBuffer)).resolves.toBe('svg');
});
