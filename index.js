import checkConfigPath from './lib/checkConfigPath.js';
import convert from './lib/convert.js';
import findConfig from './lib/findConfig.js';
import { enableVerbose } from './lib/log.js';
import optimize from './lib/optimize.js';
import prepareConfig from './lib/prepareConfig.js';
import prepareFilePaths from './lib/prepareFilePaths.js';
import prepareOutputPath from './lib/prepareOutputPath.js';

export default async function optimizt({ paths, avif, webp, force, lossless, verbose, output, config }) {
  const configFilepath = config ? checkConfigPath(config) : findConfig();
  const configData = await import(configFilepath);
  const preparedConfig = prepareConfig(configData);

  if (verbose) enableVerbose();

  if (avif || webp) {
    await convert({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png']),
      lossless,
      avif,
      webp,
      force,
      output: prepareOutputPath(output),
      config: preparedConfig.convert,
    });
  } else {
    await optimize({
      paths: prepareFilePaths(paths, ['gif', 'jpeg', 'jpg', 'png', 'svg']),
      lossless,
      output: prepareOutputPath(output),
      config: preparedConfig.optimize,
    });
  }
}
