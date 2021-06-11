const sharp = require('sharp');

async function getImageFormat(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return metadata.format;
  } catch (error) {
    return null;
  }
}

module.exports = getImageFormat;
