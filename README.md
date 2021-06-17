# @funboxteam/optimizt

<img align="right" width="192" height="192"
     alt="Optimizt avatar: OK sign with Mona Lisa picture between the fingers"
     src="./images/logo.png">

[![npm](https://img.shields.io/npm/v/@funboxteam/optimizt.svg)](https://www.npmjs.com/package/@funboxteam/optimizt)

**Optimizt** is a CLI tool that helps you prepare images during frontend development.

It can compress PNG, JPEG, GIF and SVG lossy and lossless and create AVIF and WebP versions for raster images.

[По-русски](./README.ru.md)

## Rationale

As frontend developers we have to care about pictures: compress PNG & JPEG, remove useless parts of SVG,
create AVIF and WebP for modern browsers, etc. One day we got tired of using a bunch of apps for that,
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

- `--avif` — create AVIF versions for the passed paths instead of compressing them.
- `--webp` — create WebP versions for the passed paths instead of compressing them.
- `--force` — force create AVIF and WebP even if output file size increased or file already exists.
- `-l, --lossless` — optimize losslessly instead of lossily (WebP and AVIF only).
- `-v, --verbose` — show additional info, e.g. skipped files.
- `-V, --version` — show tool version.
- `-h, --help` — show help.

## Examples

```bash
# one image optimization
optimizt path/to/picture.jpg

# list of images optimization losslessly
optimizt --lossless path/to/picture.jpg path/to/another/picture.png

# recursive AVIF creation in the passed directory
optimizt --avif path/to/directory

# recursive WebP creation in the passed directory
optimizt --webp path/to/directory

# recursive JPEG optimization in the current directory
optimizt `find . -type f -name '*.jpg'`
```

## Differences between “lossy” and “lossless”

### JPEG

In lossy mode [jpegoptim](https://github.com/tjko/jpegoptim) is used with flags: `--strip-all`,
`--all-progressive`, `--max=80`.

Lossless mode uses [Guetzli](https://github.com/google/guetzli) encoder with `--quality 90` flag.

Guetzli aims for excellent compression density at high visual quality.

If you re-optimize the same file in lossless mode, the file size may decrease, but the visual quality will also degrade.

### PNG

For both modes [pngquant](https://github.com/kornelski/pngquant) (lossy compressor) is used with flags:
`--speed 1`, `--strip`.

### GIF

For both modes [gifsicle](https://github.com/kohler/gifsicle) utility is used.

Following flags is used in lossy mode: `-O3`, `--lossy=100`.

In lossless mode no additional flags is used.

### WebP & AVIF

For both modes [sharp](https://github.com/lovell/sharp) module is used.

In lossless mode an “lossless” option is used:

- https://sharp.pixelplumbing.com/api-output#webp
- https://sharp.pixelplumbing.com/api-output#avif

## Integrations

### External Tool in WebStorm, PhpStorm, etc

<details>

#### Add an External Tool

Open _Preferences → Tools → External Tools_ and add a new tool with these options:

- Program: path to the exec file (usually simply `optimizt`)
- Arguments: desired ones, but use `$FilePath$` to pass Optimizt the path of the selected file or directory
- Working Directory: `$ContentRoot$`
- Synchronize files after execution: ✔️

Set other options at your discretion. For example:

![](images/ws_external-tools.png)

As you see on the screenshot above, you may add several “external tools” with the different options passed.

#### How to use

Run the tool through the context menu on a file or directory:

<img src="images/ws_menu.png" width="55%">

#### Shortcuts

To add shortcuts for the added tool go to _Preferences → Keymap → External Tools_:

![](images/ws_keymap.png)

</details>

### Tasks in Visual Studio Code

<details>

#### Add Task

Run `>Tasks: Open User Tasks` from the _Command Palette_.

In an open file, add new tasks to the `tasks` array, for example:

```javascript
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "optimizt: Optimize Image",
      "type": "shell",
      "command": "optimizt",
      "args": [
        "--verbose",
        {
          "value": "${file}",
          "quoting": "strong"
        }
      ],
      "presentation": {
        "echo": false,
        "showReuseMessage": false,
        "clear": true
      }
    },
    {
      "label": "optimizt: Optimize Image (lossless)",
      "type": "shell",
      "command": "optimizt",
      "args": [
        "--lossless",
        "--verbose",
        {
          "value": "${file}",
          "quoting": "strong"
        }
      ],
      "presentation": {
        "echo": false,
        "showReuseMessage": false,
        "clear": true
      }
    },
    {
      "label": "optimizt: Create WebP",
      "type": "shell",
      "command": "optimizt",
      "args": [
        "--webp",
        "--verbose",
        {
          "value": "${file}",
          "quoting": "strong"
        }
      ],
      "presentation": {
        "echo": false,
        "showReuseMessage": false,
        "clear": true
      }
    },
    {
      "label": "optimizt: Create WebP (lossless)",
      "type": "shell",
      "command": "optimizt",
      "args": [
        "--webp",
        "--lossless",
        "--verbose",
        {
          "value": "${file}",
          "quoting": "strong"
        }
      ],
      "presentation": {
        "echo": false,
        "showReuseMessage": false,
        "clear": true
      }
    }
  ]
}
```

#### How to use

1. Open the file for processing using Optimizt, it should be in the active tab.
2. Run `>Tasks: Run Task` from the _Command Palette_.
3. Select the required task.

#### Shortcuts

You can add shortcuts for a specific task by run `>Preferences: Open Keyboard Shortcuts (JSON)` from the _Command Palette_.

An example of adding a hotkey to run the "optimizt: Optimize Image (lossless)" task:

```javascript
// Place your key bindings in this file to override the defaults
[
  {
    "key": "ctrl+l",
    "command": "workbench.action.tasks.runTask",
    "args": "optimizt: Optimize Image (lossless)"
  }
]
```

</details>

### Plugin for Sublime Text 3

<details>

You’ll find the user settings directory in one of the following paths:

- macOS: `~/Library/Application Support/Sublime Text 3/Packages/User`
- Linux: `~/.config/sublime-text-3/Packages/User`
- Windows: `%APPDATA%\Sublime Text 3\Packages\User`

#### Add plugin

Inside the settings directory create a file `optimizt.py` with the following content:

```python
import os
import sublime
import sublime_plugin

optimizt = "~/.nodenv/shims/optimizt"

class OptimiztCommand(sublime_plugin.WindowCommand):
  def run(self, paths=[], options=""):
    if len(paths) < 1:
      return

    safe_paths = ["\"" + i + "\"" for i in paths]
    shell_cmd = optimizt + " " + options + " " + " ".join(safe_paths)
    cwd = os.path.dirname(paths[0])

    self.window.run_command("exec", {
      "shell_cmd": shell_cmd,
      "working_dir": cwd
    })
```

Specify path to executable inside `optimizt` variable, this path can be obtained by running
`command -v optimizt` (on *nix) or `where optimizt` (on Windows).

#### Integrate the plugin into the sidebar context menu

Inside the settings directory create a file `Side Bar.sublime-menu` with the following content:

```json
[
    {
        "caption": "Optimizt",
        "children": [
          {
              "caption": "Optimize Images",
              "command": "optimizt",
              "args": {
                "paths": [],
                "options": "--verbose"
              }
          },
          {
              "caption": "Optimize Images (lossless)",
              "command": "optimizt",
              "args": {
                "paths": [],
                "options": "--lossless --verbose"
              }
          },
          {
              "caption": "Create WebP",
              "command": "optimizt",
              "args": {
                "paths": [],
                "options": "--webp --verbose"
              }
          },
          {
              "caption": "Create WebP (lossless)",
              "command": "optimizt",
              "args": {
                "paths": [],
                "options": "--webp --lossless --verbose"
              }
          }
        ]
    }
]
```

#### How to use

Run the tool through the context menu on a file or directory:

<img src="images/st_sidebar_menu.png" width="55%">

</details>

### Workflow for GitHub Actions

<details>

Create `optimizt.yml` file in the `.github/workflows` directory of your repository.

Insert the following code into `optimizt.yml`:

```yml
name: optimizt

on:
  # Triggers the workflow on push events but only for the “main” branch
  # and only when there's JPEG/PNG in the commmit
  push:
    branches:
      - main
    paths:
      - "**.jpe?g"
      - "**.png"
  
  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  convert:
    runs-on: ubuntu-latest

    steps:
      # Install Node.js to avoid EACCESS errors upon install packages
      - uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install Optimizt
        run: npm install --global @funboxteam/optimizt

      - uses: actions/checkout@v2
        with:
          persist-credentials: false # otherwise, the token used is the GITHUB_TOKEN, instead of your personal token
          fetch-depth: 0 # get all commits (only the last one fetched by default)

      - name: Run Optimizt
        run: optimizt --verbose --force --avif --webp .

      - name: Commit changes
        run: |
          git add -A
          git config --local user.email "actions@github.com"
          git config --local user.name "github-actions[bot]"
          git diff --quiet && git diff --staged --quiet \
            || git commit -am "Create WebP & AVIF versions"

      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref }}
```

This workflow will find all JPEG and PNG files in pushed commits and add the AVIF and WebP versions via a new commit.

More examples you can find in the [workflows](./workflows) directory.

</details>

## Troubleshooting

### “spawn jpegoptim ENOENT”, “spawn guetzli ENOENT”, etc

Make sure that the [ignore-scripts](https://docs.npmjs.com/cli/v6/using-npm/config#ignore-scripts) option is not active.

More info: [#9](https://github.com/funbox/optimizt/issues/9).

### “Cannot find libjpeg”, “pkg-config: command not found”, “fatal error: 'png.h' file not found”, etc

Some operating systems may lack of required libraries and utils, so you need to install them.

Example (on macOS via [Homebrew](https://brew.sh)):

```bash
brew install pkg-config jpeg libpng
```

## Credits

Cute picture for the project was made by [Igor Garybaldi](http://pandabanda.com/).

[![Sponsored by FunBox](https://funbox.ru/badges/sponsored_by_funbox_centered.svg)](https://funbox.ru)
