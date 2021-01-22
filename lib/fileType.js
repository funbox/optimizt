const isSvg = require('is-svg');

function fileType(buffer) {
  const bufferLength = buffer.length;

  if (
    bufferLength >= 3
    && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
  ) {
    return 'gif';
  }

  if (
    bufferLength >= 3
    && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
  ) {
    return 'jpeg';
  }

  if (
    bufferLength >= 8
    && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E
    && buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A
    && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return 'png';
  }

  if (isSvg(buffer)) {
    return 'svg';
  }

  return null;
}

module.exports = fileType;
