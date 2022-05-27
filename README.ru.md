# @funboxteam/optimizt

<img align="right" width="192" height="192"
     alt="Аватар Оптимизта: «OK» жест с картиной Моной Лизой между пальцами"
     src="./images/logo.png">

[![npm](https://img.shields.io/npm/v/@funboxteam/optimizt.svg)](https://www.npmjs.com/package/@funboxteam/optimizt)

**Optimizt** — это консольная утилита, помогающая подготавливать картинки для фронтенда.

Она умеет сжимать PNG, JPEG, GIF и SVG с потерями и без, а также создавать AVIF и WebP-версии для растровых изображений.

## Мотивация

Будучи фронтендерами мы должны помнить о картинках: сжимать PNG и JPEG, удалять лишние куски из SVG,
создавать AVIF и WebP для современных браузеров и так далее. Однажды мы устали использовать кучу разных утилит для всего
этого и создали одну единственную, которая делает всё, что нам нужно.

## Использование

Установить:

```sh
npm i -g @funboxteam/optimizt
```

Оптимизировать!

```sh
optimizt path/to/picture.jpg
```

## Флаги

- `--avif` — создать AVIF-версии для переданных изображений, а не сжимать их.
- `--webp` — создать WebP-версии для переданных изображений, а не сжимать их.
- `--force` — принудительно создавать AVIF и WebP-версии игнорируя размер итогового файла и его существование.
- `-l, --lossless` — оптимизировать без потерь, а не с потерями (только для WebP и AVIF).
- `-v, --verbose` — выводить дополнительную информацию в ходе работы (например, проигнорированные файлы).
- `-o, --output` — сохранять результат в указанную директорию.
- `-V, --version` — вывести версию изображения.
- `-h, --help` — вывести справочную информацию.

## Примеры

```bash
# оптимизация одной картинки
optimizt path/to/picture.jpg

# оптимизация нескольких изображений без потерь
optimizt --lossless path/to/picture.jpg path/to/another/picture.png

# рекурсивное создание AVIF-версий для изображений в указанной директории
optimizt --avif path/to/directory

# рекурсивное создание WebP-версий для изображений в указанной директории
optimizt --webp path/to/directory

# рекурсивная оптимизация JPEG в текущей директории
find . -iname \*.jpg -exec optimizt {} +
```

## Разница между «lossy» и «lossless»

### JPEG

#### Lossy

[sharp](https://github.com/lovell/sharp) с [параметрами](https://sharp.pixelplumbing.com/api-output#jpeg):
`progressive: true`.

#### Lossless

[Guetzli](https://github.com/google/guetzli) с ключом `--quality 90`.

Guetzli позволяет получить высокий уровень компрессии и при этом сохранить хорошее визуальное качество изображения.

При повторной оптимизации одного и того же файла в режиме lossless размер изображения может уменьшаться, но при этом
визуальное качество будет так же деградировать.

### PNG

[sharp](https://github.com/lovell/sharp) с [параметрами](https://sharp.pixelplumbing.com/api-output#png):

- **lossy**: `compressionLevel: 9`, `adaptiveFiltering: false`, `palette: true`
- **lossless**: `compressionLevel: 9`, `adaptiveFiltering: true`, `palette: false`

### GIF

[gifsicle](https://github.com/kohler/gifsicle) с ключами:

- **lossy**: `-O3`, `--lossy=100`
- **lossless**: без ключей

### WebP

[sharp](https://github.com/lovell/sharp) с [параметрами](https://sharp.pixelplumbing.com/api-output#webp):

- **lossy**: `quality: 85`, `lossless: false`
- **lossless**: `quality: 85`, `lossless: true`

### WebP (GIF)

[gif2webp](https://developers.google.com/speed/webp/docs/gif2webp) с ключами:

- **lossy**: `-lossy`, `-min_size`
- **lossless**: без ключей

### AVIF

[sharp](https://github.com/lovell/sharp) с [параметрами](https://sharp.pixelplumbing.com/api-output#avif):

- **lossy**: `lossless: false`
- **lossless**: `lossless: true`

## Интеграции

### «External Tool» в WebStorm, PhpStorm и пр.

<details>

<summary>Детали</summary>

#### Добавьте «External Tool»

Откройте _Preferences → Tools → External Tools_ и добавьте новый инструмент со следующими настройками:

- Program: путь до исполняемого файла (обычно просто `optimizt`)
- Arguments: необходимые вам, но не забудьте использовать `$FilePath$` чтобы передать Оптимизту путь до выбранной директории или файла
- Working Directory: `$ContentRoot$`
- Synchronize files after execution: ✔️

Остальные настройки на ваше усмотрение. Например:

![](images/ws_external-tools.png)

Как видно на скриншоте выше, вы можете добавить несколько «внешних инструментов» с разными настройками.

#### Как использовать

Вызовите контекстное меню на файле или директории и запустите необходимое:

<img src="images/ws_menu.png" width="55%">

#### Горячие клавиши

Добавить горячие клавиши для конкретного инструмента можно в _Preferences → Keymap → External Tools_:

![](images/ws_keymap.png)

</details>

### «Tasks» в Visual Studio Code

<details>

<summary>Детали</summary>

#### Добавьте Task

С помощью _Command Palette_ выберите пункт `>Tasks: Open User Tasks`.

В открывшемся файле, в массив `tasks` добавьте нужные задачи, например:

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

#### Как использовать

1. Откройте нужный файл для обработки с помощью Оптимизта, он должен быть в активной вкладке.
2. С помощью _Command Palette_ выберите пункт `>Tasks: Run Task`.
3. Выберите нужную задачу.

#### Горячие клавиши

Добавить горячую клавишу для задачи можно выбрав пункт `>Preferences: Open Keyboard Shortcuts (JSON)` в _Command Palette_.

Пример добавления горячей клавиши для запуска задачи «optimizt: Optimize Image (lossless)»:

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

### Плагин для Sublime Text 3

<details>

<summary>Детали</summary>

Пути расположения пользовательских настроек:

- macOS: `~/Library/Application Support/Sublime Text 3/Packages/User`
- Linux: `~/.config/sublime-text-3/Packages/User`
- Windows: `%APPDATA%\Sublime Text 3\Packages\User`

#### Добавьте плагин

В директории настроек создайте файл `optimizt.py` со следующим содержимым:

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

В переменной `optimizt` пропишите путь до исполняемого файла, который можно получить с помощью выполнения команды
`command -v optimizt` (в *nix) или `where optimizt` (в Windows).

#### Интегрируйте плагин в контекстное меню сайдбара

В директории настроек создайте файл `Side Bar.sublime-menu` со следующим содержимым:

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

#### Как использовать

Вызовите контекстное меню на файле или директории и запустите необходимое:

<img src="images/st_sidebar_menu.png" width="55%">

</details>

### «Workflow» для GitHub Actions

<details>

Создайте файл `optimizt.yml` в директории `.github/workflows` вашего репозитория.

Вставьте следующий код в файл `optimizt.yml`:

```yml
name: optimizt

on:
  # Срабатывает на событие "push" для ветки "main", но только при наличии
  # каких-либо изменений JPEG и PNG файлов в коммите.
  push:
    branches:
      - main
    paths:
      - "**.jpe?g"
      - "**.png"
  
  # Разрешаем ручной запуск данного воркфлоу из таба Actions
  workflow_dispatch:

jobs:
  convert:
    runs-on: ubuntu-latest

    steps:
      # Устанавливаем Node.js для того чтобы избежать ошибки EACCESS
      # во время дальнейшей установки пакетов
      - uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install Optimizt
        run: npm install --global @funboxteam/optimizt

      - uses: actions/checkout@v2
        with:
          persist-credentials: false # используем персональный токен доступа, вместо GITHUB_TOKEN
          fetch-depth: 0 # загружаем все коммиты (по умолчанию грузится только последний)

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

Данный воркфлоу отслеживает наличие JPEG и PNG файлов в новых коммитах, и при обнаружении таковых добавит AVIF и WebP
версии с помощью нового коммита.

Больше примеров можно найти в директории [workflows](./workflows).

</details>

## Решение проблем

### «spawn guetzli ENOENT» и т. д.

Перед установкой необходимо убедиться в том, что не используется опция
[ignore-scripts](https://docs.npmjs.com/cli/v6/using-npm/config#ignore-scripts).

Подробнее: [#9](https://github.com/funbox/optimizt/issues/9).

### «pkg-config: command not found», «fatal error: 'png.h' file not found» и т. д.

На некоторых ОС могут отсутствовать необходимые библиотеки и утилиты, нужно установить их самостоятельно.

Пример установки на macOS с помощью [Homebrew](https://brew.sh/index_ru):

```bash
brew install pkg-config libpng
```

## Docker

### Сборка образа

Для того чтобы собрать Докер образ, нужно:

1. Клонировать этот репозиторий и перейти в него.
2. Выполнить `docker build -t funbox/optimizt .`.

ИЛИ:

- Выполнить `docker build -t funbox/optimizt https://github.com/funbox/optimizt.git`, но нужно иметь ввиду, что файл
  [.dockerignore](.dockerignore) будет [проигнорирован](https://github.com/docker/cli/issues/2827).

### Запуск контейнера

Внутри контейнера значение WORKDIR установлено как `/src`, поэтому все пути будут разрешаться относительно неё.

Пример использования:

```bash
docker run -v $(pwd):/src optimizt --webp image.png
```

## Благодарности

Клёвую картинку для репозитория нарисовал [Игорь Гарибальди](http://pandabanda.com/).

[![Sponsored by FunBox](https://funbox.ru/badges/sponsored_by_funbox_centered.svg)](https://funbox.ru)
