# @funboxteam/optimizt

<img align="right" width="192" height="192"
     alt="Аватар Оптимизта: «OK» жест с картиной Моной Лизой между пальцами"
     src="./images/logo.png">

[![npm](https://img.shields.io/npm/v/@funboxteam/optimizt.svg)](https://www.npmjs.com/package/@funboxteam/optimizt)

**Optimizt** — это консольная утилита, помогающая подготавливать картинки для фронтенда. 

Она умеет сжимать PNG, JPEG, GIF и SVG с потерями и без, а также создавать WebP-версии для растровых изображений.

## Мотивация

Будучи фронтендерами мы должны помнить о картинках: сжимать PNG и JPEG, удалять лишние куски из SVG,
создавать WebP для современных браузеров и так далее. Однажды мы устали использовать кучу разных утилит для всего этого
и создали одну единственную, которая делает всё, что нам нужно.  

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

- `--webp` — создать WebP-версии для переданных изображений, а не сжимать их.  
- `-l, --lossless` — оптимизировать без потерь, а не с потерями.  
- `-v, --verbose` — выводить дополнительную информацию в ходе работы (например, проигнорированные файлы).
- `-V, --version` — вывести версию изображения.
- `-h, --help` — вывести справочную информацию.

## Примеры

```bash
# оптимизация одной картинки
optimizt path/to/picture.jpg

# оптимизация нескольких изображений без потерь без потерь
optimizt --lossless path/to/picture.jpg path/to/another/picture.png

# рекурсивное создание WebP-версий для изображений в указанной директории
optimizt --webp path/to/directory

# рекурсивная оптимизация JPEG в текущей директории
optimizt `find . -type f -name '*.jpg'`
```

## Интеграции

### «External Tool» в WebStorm, PhpStorm и пр.

#### Добавьте «External Tool»

Откройте _Preferences → Tools → External Tools_ и добавьте новый инструмент со следующими настройками:

- Program: путь до исполняемого файла (обычно просто `optimizt`)
- Arguments: необходимые вам, но не забудьте использовать `$FilePath$` чтобы передать Оптимизту путь до выбранной директории или файла
- Working Directory: `$ContentRoot$`
- Synchronize files after execution: ✔️

Остальные настройки на ваше усмотрение. Например:

![](images/ws_external-tools.png)

Как видно на скриншоте выше, вы можете добавить несколько «внешних инструментов» с разными настройками. 

### Как использовать

Вызовите контекстное меню на файле или директории и запустите необходимое:

![](images/ws_menu.png)

### Горячие клавиши

Добавить горячие клавиши для конкретного инструмента можно в _Preferences → Keymap → External Tools_: 

![](images/ws_keymap.png)

## Благодарности

Клёвую картинку для репозитория нарисовал [Игорь Гарибальди](http://pandabanda.com/).

[![Sponsored by FunBox](https://funbox.ru/badges/sponsored_by_funbox_centered.svg)](https://funbox.ru)
