# @funboxteam/optimizt

**optimizt** is a CLI tool for images compression and optimization. It also creates WebP version for PNG & JPEG images.

[По-русски](./README.ru.md)

## Installation

```sh
npm i -g @funboxteam/optimizt
```

## Available options

- `--webp` — create WebP versions for the passed paths.
- `-l, --lossless` — optimize lossless. [Guetzli](https://github.com/google/guetzli) encoder will be used for JPEG. [`lossless`](https://developers.google.com/speed/webp/docs/cwebp) flag will be enabled for WebP creation.
- `-v, --verbose` — show additional info, e.g. skipped files.
- `-V, --version` — show tool version.
- `-h, --help` — show help.

## Examples

```bash
# one image optimization
optimizt path/to/picture.jpg

# list of images optimization
optimizt path/to/picture.jpg path/to/another/picture.png

# recursive images optimization in the passed directory
optimizt path/to/directory

# recursive JPEG optimization in the current directory
optimizt `find . -type f -name '*.jpg'`
```

## Use it as External Tool in WebStorm

### How to add

Open _Preferences → Tools → External Tools_ and add the new toll with these options:

- Name: `Optimize Images`
- Description: `Image optimization tool`
- Program: `path to the exec file`
- Arguments: `$FilePath$`
- Working Directory: `$ContentRoot$`
- Synchronize files after execution
- Open console for tool output

![](images/ws_external-tools.png)

### How to use

Run the tool through the context menu on a file or directory: 

![](images/ws_menu.png)

### Hotkeys

To add hotkeys for the tool go to _Preferences → Keymap → External Tools_:

![](images/ws_keymap.png)
