const fs = require('fs');
const path = require('path');

module.exports = function copyRecursive(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to);

  fs.readdirSync(from, { withFileTypes: true }).forEach(item => {
    const fromPath = path.join(from, item.name);
    const toPath = path.join(to, item.name);

    if (item.isDirectory()) {
      copyRecursive(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
};
