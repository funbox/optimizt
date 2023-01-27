import fs from 'node:fs';
import path from 'node:path';

import { logErrorAndExit } from './log.js';

export default function prepareOutputPath(outputPath) {
  if (!outputPath) return '';

  const resolvedPath = path.resolve(outputPath);

  if (!fs.existsSync(resolvedPath)) {
    logErrorAndExit('Output path does not exist');
  }

  if (!fs.lstatSync(resolvedPath).isDirectory()) {
    logErrorAndExit('Output path must be a directory');
  }

  return resolvedPath;
}
