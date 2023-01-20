import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultFilename = '.optimiztrc.js';
const defaultDirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPath = path.join(defaultDirname, defaultFilename);

export default function findConfig(filepath = process.cwd()) {
  const resolvedPath = path.resolve(filepath, defaultFilename);

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    return resolvedPath;
  }

  const { root, dir } = path.parse(resolvedPath);
  const isRootDirectory = dir === root;

  return isRootDirectory
    ? defaultPath
    : findConfig(path.dirname(dir));
}
