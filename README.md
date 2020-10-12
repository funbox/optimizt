# @funboxteam/optimizt

<img align="right" width="192" height="192"
     alt="Optimizt avatar: OK sign with Mona Lisa picture between the fingers"
     src="./images/logo.png">

[![npm](https://img.shields.io/npm/v/@funboxteam/optimizt.svg)](https://www.npmjs.com/package/@funboxteam/optimizt)

**Optimizt** is a CLI tool that helps you prepare images during frontend development. 

It can compress PNG, JPEG, GIF and SVG lossy and lossless and create WebP versions for raster images.

[По-русски](./README.ru.md)

## Rationale

As frontend developers we have to care about pictures: compress PNG & JPEG, remove useless parts of SVG,
create WebP for modern browsers, etc. One day we got tired of using a bunch of apps for that,
and created one tool that does everything we want.  

## Usage

Install the tool:
 
```sh
npm i -g @funboxteam/optimizt
```

Optimize!

```sh
optimizt path/to/picture.jpg
```

## Command line flags

- `--webp` — create WebP versions for the passed paths instead of compressing them.  
- `-l, --lossless` — optimize losslessly instead of lossily.  
- `-v, --verbose` — show additional info, e.g. skipped files.
- `-V, --version` — show tool version.
- `-h, --help` — show help.

## Examples

```bash
# one image optimization
optimizt path/to/picture.jpg

# list of images optimization losslessly
optimizt --lossless path/to/picture.jpg path/to/another/picture.png

# recursive WebP creation in the passed directory
optimizt --webp path/to/directory

# recursive JPEG optimization in the current directory
optimizt `find . -type f -name '*.jpg'`
```

## Integrations

### External Tool in WebStorm, PhpStorm, etc

#### Add an External Tool

Open _Preferences → Tools → External Tools_ and add a new tool with these options:

- Program: path to the exec file (usually simply `optimizt`)
- Arguments: desired ones, but use `$FilePath$` to pass Optimizt the path of the selected file or directory
- Working Directory: `$ContentRoot$`
- Synchronize files after execution: ✔️

Set other options at your discretion. For example:

![](images/ws_external-tools.png)

As you see on the screenshot above, you may add several “external tools” with the different options passed. 

### How to use

Run the tool through the context menu on a file or directory: 

<img src="images/ws_menu.png" width="55%">

### Shortcuts

To add shortcuts for the added tool go to _Preferences → Keymap → External Tools_:

![](images/ws_keymap.png)

## Credits

Cute picture for the project was made by [Igor Garybaldi](http://pandabanda.com/).

[![Sponsored by FunBox](https://funbox.ru/badges/sponsored_by_funbox_centered.svg)](https://funbox.ru)
