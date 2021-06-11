const sharp = require('sharp');

async function setSrgbColorspace(buffer) {
  const image = await sharp(buffer);
  const metadata = await image.metadata();

  return metadata.space === 'srgb'
    ? buffer
    : image.toColorspace('srgb').toBuffer();
}

module.exports = setSrgbColorspace;
