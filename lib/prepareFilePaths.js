const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');

module.exports = function prepareFilePaths(paths, extensions) {
  let pathsList = paths
    .filter(fs.existsSync)
    .map(filePath => {
      if (fs.lstatSync(filePath).isDirectory()) {
        // search for files recursively inside the dir
        return fg.sync(
          `${path.resolve(filePath)}/**/*.+(${extensions.join('|')})`,
          { caseSensitiveMatch: false },
        );
      }

      // filter files by extension
      return extensions.includes(path.extname(filePath).toLowerCase().substr(1))
        ? filePath
        : null;
    })
    .filter(Boolean);

  // flat the list and remove duplicates
  pathsList = [...new Set([].concat(...pathsList))];

  // use relative paths when it's possible
  pathsList = pathsList.map(p => p.replace(`${process.cwd()}${path.sep}`, ''));

  return pathsList;
};
