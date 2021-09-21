const removeUnknownsAndDefaults = require('./removeUnknownsAndDefaults');

module.exports = {
  multipass: true,
  js2svg: {
    pretty: true,
    indent: 2,
  },
  plugins: [
    /*
      We want to remove useless parts of SVG, but to leave `stroke="none"`.
      For this purpose we use here a custom version of `removeUnknownsAndDefaults`.
     */
    {
      name: 'removeUnknownsAndDefaults',
      ...removeUnknownsAndDefaults,
    },

    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    'cleanupEnableBackground',
    'minifyStyles',
    'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeNonInheritableGroupAttrs',
    'removeUnusedNS',
    'cleanupIDs',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'mergePaths',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'sortAttrs',
    'sortDefsChildren',
  ],
};
