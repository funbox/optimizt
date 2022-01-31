const fs = require('fs');
const path = require('path');

module.exports = function prepareWriteFilePath(filePath, outputDir) {
  if (!outputDir) return filePath;

  const replacePath = `${process.cwd()}${path.sep}`;
  const { base, dir } = path.parse(filePath);
  const [, ...subDirs] = dir.split(path.sep);

  fs.mkdirSync(path.join(outputDir, ...subDirs), { recursive: true });

  return path.join(outputDir, ...subDirs, base).replace(replacePath, '');
};
