#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');

const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminOptipng = require('imagemin-optipng');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');

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

const extRaster = ['gif', 'jpeg', 'jpg', 'png'];
const extVector = ['svg'];

let files = processArgs.filter(fs.existsSync);

files = files.map(file => {
  const isDirectory = fs.lstatSync(file).isDirectory();

  if (isDirectory) {
    return glob.sync(`${file}/**/*.+(${[...extRaster, ...extVector].join('|')})`);
  }

  return file;
});

files = [...new Set([].concat(...files))];

const filesRaster = files
  .filter(f => extRaster.includes(path.extname(f).toLowerCase().substr(1)));
const filesVector = files
  .filter(f => extVector.includes(path.extname(f).toLowerCase().substr(1)));

async function optimize(paths) {
  const optimizedFiles = await imagemin(paths, {
    plugins: [
      imageminGifsicle(),
      imageminMozjpeg(),
      imageminOptipng(),
      imageminPngquant(),
      imageminSvgo(svgoOptions),
    ],
  });

  optimizedFiles.forEach(f => fs.writeFileSync(f.sourcePath, f.data));
}

async function createWebp(paths) {
  const webpFiles = await imagemin(paths, { plugins: [imageminWebp()] });

  webpFiles.forEach(({ data, sourcePath }) => {
    const { dir, name } = path.parse(sourcePath);

    fs.writeFileSync(path.join(dir, `${name}.webp`), data);
  });
}

optimize([...filesRaster, ...filesVector]);
createWebp(filesRaster);
