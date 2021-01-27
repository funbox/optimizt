const sharp = require('sharp');

async function fileType(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return metadata.format;
  } catch (error) {
    return null;
  }
}

module.exports = fileType;
