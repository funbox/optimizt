export default {
  optimize: {
    jpeg: {
      // https://sharp.pixelplumbing.com/api-output#jpeg
      lossy: {
        quality: 80, // quality, integer 1-100
        progressive: true, // use progressive (interlace) scan
        chromaSubsampling: '4:2:0', // set to '4:4:4' to prevent chroma subsampling otherwise defaults to '4:2:0' chroma subsampling
        optimizeCoding: true, // optimise Huffman coding tables
        mozjpeg: false, // use mozjpeg defaults, equivalent to { trellisQuantisation: true, overshootDeringing: true, optimiseScans: true, quantisationTable: 3 }
        trellisQuantisation: false, // apply trellis quantisation
        overshootDeringing: false, // apply overshoot deringing
        optimizeScans: false, // optimise progressive scans, forces progressive
        quantizationTable: 0, // quantization table to use, integer 0-8
      },
      // https://github.com/google/guetzli
      lossless: {
        quality: 90, // visual quality to aim for, expressed as a JPEG quality value
        memlimit: 6000, // memory limit in MB; guetzli will fail if unable to stay under the limit
        nomemlimit: false, // do not limit memory usage
      },
    },

    // https://sharp.pixelplumbing.com/api-output#png
    png: {
      lossy: {
        progressive: false, // use progressive (interlace) scan
        compressionLevel: 9, // zlib compression level, 0 (fastest, largest) to 9 (slowest, smallest)
        adaptiveFiltering: false, // use adaptive row filtering
        palette: true, // quantise to a palette-based image with alpha transparency support
        quality: 100, // use the lowest number of colours needed to achieve given quality, sets palette to true
        effort: 7, // CPU effort, between 1 (fastest) and 10 (slowest), sets palette to true
        colors: 256, // maximum number of palette entries, sets palette to true
        dither: 1.0, // level of Floyd-Steinberg error diffusion, sets palette to true
      },
      lossless: {
        progressive: false,
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: false,
        quality: 100,
        effort: 7,
        colors: 256,
        dither: 1.0,
      },
    },

    // http://www.lcdf.org/gifsicle/man.html
    gif: {
      lossy: {
        optimize: 3, // attempt to shrink the file sizes of GIF animations; higher levels take longer, but may have better results; there are currently three levels
        careful: false, // write larger GIFs that avoid bugs in other programs
        colors: 256, // reduce the number of distinct colors to num or less; must be between 2 and 256
        lossy: 100, // alter image colors to shrink output file size at the cost of artifacts and noise
      },
      lossless: {
        optimize: 0,
        careful: true,
        colors: 256,
        lossy: 0,
      },
    },

    // https://github.com/svg/svgo#configuration
    svg: {
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
        'removeUnknownsAndDefaultsPATCHED',
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
        'cleanupListOfValues',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'mergePaths',
        'convertShapeToPath',
        'convertEllipseToCircle',
        'sortAttrs',
        'sortDefsChildren',
        'reusePaths',
      ],
    },
  },

  convert: {
    // https://sharp.pixelplumbing.com/api-output#avif
    avif: {
      lossy: {
        quality: 50, // quality, integer 1-100
        lossless: false, // use lossless compression
        effort: 4, // CPU effort, between 0 (fastest) and 9 (slowest)
        chromaSubsampling: '4:4:4', // set to '4:2:0' to use chroma subsampling
      },
      lossless: {
        quality: 50,
        lossless: true,
        effort: 4,
        chromaSubsampling: '4:4:4',
      },
    },

    // https://sharp.pixelplumbing.com/api-output#webp
    webp: {
      lossy: {
        quality: 85, // quality, integer 1-100
        alphaQuality: 100, // quality of alpha layer, integer 0-100
        lossless: false, // use lossless compression mode
        nearLossless: false, // use near_lossless compression mode
        smartSubsample: false, // use high quality chroma subsampling
        effort: 4, // CPU effort, between 0 (fastest) and 6 (slowest)
        minSize: false, // prevent use of animation key frames to minimise file size (slow)
        mixed: false, // allow mixture of lossy and lossless animation frames (slow)
      },
      lossless: {
        quality: 85,
        alphaQuality: 100,
        lossless: true,
        nearLossless: false,
        smartSubsample: false,
        effort: 4,
        minSize: false,
        mixed: false,
      },
    },

    // TODO: Replace gif2webp with sharp
    // https://developers.google.com/speed/webp/docs/gif2webp
    webpGif: {
      lossy: {
        lossy: true, // encode image using lossy compression
        mixed: false, // for each frame in the image, pick lossy or lossless compression heuristically
        q: 75, // in case of lossy compression, a small factor produces a smaller file with lower quality; best quality is achieved by using a value of 100
        m: 6, // compression method (0=fast, 6=slowest)
        min_size: true, // minimize output size; can be combined with -q, -m, -lossy or -mixed options
        f: 0, // filter strength (0=off..100); for lossy encoding only
        metadata: 'xmp', // comma separated list of metadata to copy from the input to the output if present; valid values: all, none, icc, xmp
        loop_compatibility: false, // use compatibility mode for Chrome version prior to M62 (inclusive)
        mt: true, // use multi-threading if available
      },
      lossless: {
        lossy: false,
        mixed: false,
        q: 100,
        m: false,
        min_size: false,
        metadata: 'xmp',
        loop_compatibility: false,
        mt: true,
      },
    },
  },
};
