import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import setSrgbColorspace from '../lib/setSrgbColorspace.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const bwImageBuffer = fs.readFileSync(path.resolve(dirname, 'images', 'jpeg-one-pixel.jpg'));
const srgbImageBuffer = fs.readFileSync(path.resolve(dirname, 'images', 'jpeg-low-quality.jpg'));

test('Output colorspace always sRGB', async () => {
  await expect(getColorspace(bwImageBuffer)).resolves.toBe('b-w');
  await expect(getColorspace(await setSrgbColorspace(bwImageBuffer))).resolves.toBe('srgb');
  await expect(getColorspace(await setSrgbColorspace(srgbImageBuffer))).resolves.toBe('srgb');
});

async function getColorspace(buffer) {
  const image = await sharp(buffer);
  const metadata = await image.metadata();

  return metadata.space;
}
