const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');

module.exports = function prepareFilePaths(paths, extensions) {
  const fgExtensions = extensions.join('|');
  const replacePath = `${process.cwd()}${path.sep}`;
  const filePaths = [...new Set(paths.reduce((acc, filePath) => {
    if (fs.existsSync(filePath)) {
      // search for files recursively inside the dir
      if (fs.lstatSync(filePath).isDirectory()) {
        acc = acc.concat(fg.sync(
          `${path.resolve(filePath)}/**/*.+(${fgExtensions})`,
          { caseSensitiveMatch: false },
        ));
      }

      // filter files by extension
      if (extensions.includes(path.extname(filePath).toLowerCase().substr(1))) {
        acc.push(filePath);
      }
    }

    return acc;
  }, []))];

  // use relative paths when it's possible
  return filePaths.map(p => p.replace(replacePath, ''));
};
