#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const { EOL } = require('os');
const path = require('path');

const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminOptipng = require('imagemin-optipng');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');

const ora = require('ora');

const colorize = require('./lib/colorize');
const formatBytes = require('./lib/formatBytes');
const { error, info, success, warning } = require('./lib/log');

const svgoOptions = {
  plugins: [
    { removeDoctype: true },
    { removeXMLProcInst: true },
    { removeComments: true },
    { removeMetadata: true },
    { removeXMLNS: false },
    { removeEditorsNSData: true },
    { cleanupAttrs: true },
    { inlineStyles: true },
    { minifyStyles: true },
    { convertStyleToAttrs: true },
    { cleanupIDs: false },
    { prefixIds: false },
    { removeRasterImages: false },
    { removeUselessDefs: true },
    { cleanupNumericValues: true },
    { cleanupListOfValues: false },
    { convertColors: true },
    { removeUnknownsAndDefaults: true },
    { removeNonInheritableGroupAttrs: true },
    { removeUselessStrokeAndFill: true },
    { removeViewBox: false },
    { cleanupEnableBackground: true },
    { removeHiddenElems: true },
    { removeEmptyText: true },
    { convertShapeToPath: true },
    { convertEllipseToCircle: true },
    { moveElemsAttrsToGroup: true },
    { moveGroupAttrsToElems: true },
    { collapseGroups: true },
    { convertPathData: true },
    { convertTransform: true },
    { removeEmptyAttrs: true },
    { removeEmptyContainers: true },
    { mergePaths: true },
    { removeUnusedNS: true },
    { sortAttrs: true },
    { sortDefsChildren: true },
    { removeTitle: false },
    { removeDesc: true },
    { removeDimensions: true },
    { removeAttrs: false },
    { removeAttributesBySelector: false },
    { removeElementsByAttr: false },
    { addClassesToSVGElement: false },
    { removeStyleElement: false },
    { removeScriptElement: false },
    { addAttributesToSVGElement: false },
    { removeOffCanvasPaths: false },
    { reusePaths: false },
  ],
  js2svg: {
    pretty: true,
    indent: 2,
  },
};

const processArgs = process.argv.slice(2);
const spinner = ora('Processing. Please wait...').start();


const extRaster = ['gif', 'jpeg', 'jpg', 'png'];
const extVector = ['svg'];

let files = processArgs.filter(fs.existsSync);

files = files.map(file => {
  const isDirectory = fs.lstatSync(file).isDirectory();

  if (isDirectory) {
    const extensions = [...extRaster, ...extVector];

    return glob.sync(`${path.resolve(file)}/**/*.+(${extensions.join('|')})`, {
      nocase: true,
    });
  }

  return file;
});

files = [...new Set([].concat(...files))];

const filesRaster = files
  .filter(f => extRaster.includes(path.extname(f).toLowerCase().substr(1)));
const filesVector = files
  .filter(f => extVector.includes(path.extname(f).toLowerCase().substr(1)));


async function optimize(paths) {
  spinner.start(`Optimizing ${paths.length} images...`);

  const optimizedFiles = await imagemin(paths, {
    plugins: [
      imageminGifsicle(),
      imageminMozjpeg(),
      imageminOptipng(),
      imageminPngquant(),
      imageminSvgo(svgoOptions),
    ],
  });

  spinner.clear();

  optimizedFiles.forEach(f => {
    const ext = path.extname(f.sourcePath).toLowerCase();
    const fileSize = fs.statSync(f.sourcePath).size;
    const fileSizeOptimized = f.data.byteLength;
    const ratio = Math.round((fileSizeOptimized - fileSize) / fileSize * 100.0);

    if (fileSize > fileSizeOptimized) {
      success(f.sourcePath);
      console.log(' ', colorize(`${formatBytes(fileSize, 0)} → ${formatBytes(fileSizeOptimized, 0)}. Ratio: ${ratio}%`).dim, EOL);

      fs.writeFileSync(f.sourcePath, f.data);
    } else if (ext === '.svg') {
      warning(f.sourcePath);
      console.log(' ', colorize(colorize(`${formatBytes(fileSize, 0)} → ${formatBytes(fileSizeOptimized, 0)}. Ratio: ${ratio ? `+${ratio}` : ratio}%`).black).bgYellow, EOL);

      fs.writeFileSync(f.sourcePath, f.data);
    } else {
      error(f.sourcePath);
      console.log(' ', colorize('Optimized file is bigger than original. Skipped.').dim, EOL);
    }
  });

  spinner.succeed('Optimizing completed');
  console.log(' ', '---', EOL, EOL);
}


async function createWebp(paths) {
  spinner.start(`Creating WebP for ${paths.length} images...`);

  const webpFiles = await imagemin(paths, { plugins: [imageminWebp()] });

  spinner.clear();

  webpFiles.forEach(({ data, sourcePath }) => {
    const { dir, name } = path.parse(sourcePath);
    const fileSize = fs.statSync(sourcePath).size;
    const fileSizeOptimized = data.byteLength;
    const ratio = Math.round((fileSizeOptimized - fileSize) / fileSize * 100.0);
    const saveFilePath = path.join(dir, `${name}.webp`);

    if (fileSize > fileSizeOptimized) {
      success(saveFilePath);
      console.log(' ', colorize(`${formatBytes(fileSize, 0)} → ${formatBytes(fileSizeOptimized, 0)}. Ratio: ${ratio}%`).dim, EOL);

      fs.writeFileSync(saveFilePath, data);
    } else {
      error(saveFilePath);
      console.log(' ', colorize('WebP file is bigger than original. Skipped.').dim, EOL);
    }
  });

  spinner.succeed('Creating WebP completed');
  console.log(' ', '---', EOL, EOL);
}


(async () => {
  await optimize([...filesRaster, ...filesVector]);
  await createWebp(filesRaster);
  spinner.stop();
})();
