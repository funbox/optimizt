const fs = require('fs');
const path = require('path');

const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminGuetzli = require('imagemin-guetzli');
const imageminJpegoptim = require('imagemin-jpegoptim');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');

const formatBytes = require('../lib/formatBytes');
const { log } = require('../lib/log');
const spinner = require('../lib/spinner');

async function optimize({ paths, lossless }) {
  if (!paths.length) return;

  spinner.start(`Optimizing ${paths.length} images (${lossless ? 'lossless' : 'lossy'})...`);

  const pathsByExt = paths.reduce((acc, filePath) => {
    acc[/jpe?g$/ig.test(path.extname(filePath)) ? 'jpeg' : 'other'].push(filePath);

    return acc;
  }, { jpeg: [], other: [] });

  /*
    It's important to split files on JPEGs & the rest ones.
    At the time of lossless optimization Guetzli encoder will be used,
    and it converts PNGs to JPEGs.
   */
  const jpeg = await imagemin(pathsByExt.jpeg, {
    plugins: lossless
      ? [imageminGuetzli({ quality: 90 })]
      : [imageminJpegoptim({ progressive: true, max: 80 })],
  });

  const other = await imagemin(pathsByExt.other, {
    plugins: [
      imageminGifsicle(),
      imageminPngquant({
        speed: 1,
        strip: true,
      }),
      imageminSvgo({
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
          { cleanupIDs: true },
          { prefixIds: false },
          { removeRasterImages: false },
          { removeUselessDefs: true },
          { cleanupNumericValues: true },
          { cleanupListOfValues: false },
          { convertColors: true },
          { removeUnknownsAndDefaults: false },
          { removeNonInheritableGroupAttrs: true },
          { removeUselessStrokeAndFill: false },
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
          { removeTitle: true },
          { removeDesc: true },
          { removeDimensions: false },
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
      }),
    ],
  });

  spinner.clear();

  [...jpeg, ...other].forEach(file => {
    const ext = path.extname(file.sourcePath).toLowerCase();

    const fileSize = fs.statSync(file.sourcePath).size;
    const fileSizeOptimized = file.data.byteLength;
    const ratio = Math.round((fileSizeOptimized - fileSize) / fileSize * 100);

    const successMessage = `${formatBytes(fileSize)} → ${formatBytes(fileSizeOptimized)}. Ratio: ${ratio > 0 ? `+${ratio}` : ratio}%`;

    if (ratio < 0) {
      log({
        type: 'success',
        title: file.sourcePath,
        message: successMessage,
      });

      fs.writeFileSync(file.sourcePath, file.data);
    } else if (!fs.readFileSync(file.sourcePath).equals(file.data)) {
      if (ext === '.svg') {
        log({
          type: 'warning',
          title: file.sourcePath,
          message: successMessage,
        });

        fs.writeFileSync(file.sourcePath, file.data);
      } else {
        log({
          title: file.sourcePath,
          message: 'File size increased. Skipped',
        });
      }
    } else {
      log({
        title: file.sourcePath,
        message: 'Nothing changed. Skipped',
      });
    }
  });

  spinner.succeed('Optimizing completed');
}

module.exports = optimize;
