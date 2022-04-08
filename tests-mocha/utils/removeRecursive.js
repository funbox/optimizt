const fs = require('fs');
const path = require('path');

module.exports = function removeRecursive(dir) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
    const curPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      removeRecursive(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  });

  fs.rmdirSync(dir);
};
