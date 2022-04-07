const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const setSrgbColorspace = require('../lib/setSrgbColorspace');

const bwImageBuffer = fs.readFileSync(path.resolve(__dirname, 'images', 'jpeg-one-pixel.jpg'));
const srgbImageBuffer = fs.readFileSync(path.resolve(__dirname, 'images', 'jpeg-low-quality.jpg'));

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
