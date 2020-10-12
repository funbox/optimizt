function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const decimals = 3;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // use parseFloat to show "1 KB" instead of "1.000 KB"
  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

module.exports = formatBytes;
