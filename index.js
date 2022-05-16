import convert from './lib/convert.js';
import { enableVerbose } from './lib/log.js';
import optimize from './lib/optimize.js';
import prepareFilePaths from './lib/prepareFilePaths.js';
import prepareOutputPath from './lib/prepareOutputPath.js';

export default async function optimizt({ paths, avif, webp, force, lossless, verbose, output }) {
  if (verbose) enableVerbose();

  if (avif || webp) {
    await convert({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png']),
      lossless,
      avif,
      webp,
      force,
      output: prepareOutputPath(output),
    });
  } else {
    await optimize({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png', 'svg']),
      lossless,
      output: prepareOutputPath(output),
    });
  }
}
