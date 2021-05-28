# Changelog

## 2.6.0 (28.05.2021)

Spinner was replaced with a progress bar.


## 2.5.0 (08.04.2021)

Added `--force` flag to CLI, which allows creating AVIF and WebP even if output file size increased or file already exists.

Added [workflows](./workflows) directory with examples of GitHub Actions workflows.

Enabled use of [LZW compression](https://github.com/kohler/gifsicle/commit/0fd160b506ab0c4bce9f6852b494dc2b4ac9733f)
to optimize GIF files in lossy mode.


## 2.4.2 (19.02.2021)

Fixed ratio logging.


## 2.4.1 (16.02.2021)

Added Troubleshooting section to [README.md](README.md).

Added error handler for `jpegoptim` child process.


## 2.4.0 (27.01.2021)

Added AVIF support.


## 2.3.1 (25.01.2021)

Fixed GIF to WebP conversion.


## 2.3.0 (25.01.2021)

Bye-bye imagemin. Now we use optimizers directly.

Added a limit on the number of optimization tasks run simultaneously.

Fixed a bug with JPEG processing (jpegoptim could crash with some files).


## 2.2.0 (28.10.2020)

Updated dependencies.

Unpinned dependencies versions to major range.



## 2.1.0 (27.10.2020)

Added disabling coloring output when no TTY found.


## 2.0.1 (12.10.2020)

Removed unused logic from [formatBytes](lib/formatBytes.js).

Optimized [prepareFilePaths](lib/prepareFilePaths.js) function.

Updated images used in README.


## 2.0.0 (07.10.2020)

Prepared the package for publishing on GitHub.

Updated some deps, fixed small linter errors, added LICENSE.


## 1.0.1 (09.06.2020)

We continue the glorious tradition of “Publish first, think later”.

Removed useless files from the bundled package.


## 1.0.0 (18.05.2020)

First major version!

The script does everything described in [README](./README.md):

1. Compresses raster images lossy and lossless.

2. Optimizes SVG files preserving their readability.

3. Generates WebP versions while optimizing raster images.


## 0.1.0 (06.04.2020)

Init version.
