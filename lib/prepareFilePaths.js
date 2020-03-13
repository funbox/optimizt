const fs = require('fs');
const glob = require('glob');
const path = require('path');

const EXTENSIONS = ['gif', 'jpeg', 'jpg', 'png', 'svg'];

module.exports = function prepareFilePaths(paths) {
  const files = paths
    .filter(fs.existsSync)
    .map(file => {
      if (fs.lstatSync(file).isDirectory()) {
        return glob.sync(
          `${path.resolve(file)}/**/*.+(${EXTENSIONS.join('|')})`,
          { nocase: true },
        );
      }

      return EXTENSIONS.includes(path.extname(file).toLowerCase().substr(1));
    })
    .filter(Boolean);

  return [...new Set([].concat(...files))];
};
