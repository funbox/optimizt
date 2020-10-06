# @funboxteam/optimizt

**optimizt** — это CLI-утилита для оптимизации и сжатия изображений, а так же для подготовки графики в формате WebP.

## Установка

```sh
npm i -g @funboxteam/optimizt
```

## Доступные флаги

- `--webp` — создание графики в формате WebP для указанных изображений;
- `-l, --lossless` — режим сжатия «без потерь», для JPEG-изображений будет использоваться энкодер [Guetzli](https://github.com/google/guetzli), а при создании WebP будет активирован ключ [lossless](https://developers.google.com/speed/webp/docs/cwebp);
- `-v, --verbose` — вывод дополнительной информации, например о пропущенных файлах;
- `-V, --version` — отображение версии утилиты;
- `-h, --help` — отображение информации по использованию утилиты.

## Примеры работы с CLI

```bash
# Оптимизация изображения
optimizt path/to/picture.jpg

# Оптимизация изображений в указанной директории (рекурсивно)
optimizt path/to/directory

# Оптимизация списка изображений
optimizt path/to/picture.jpg path/to/another/picture.png

# Рекурсивная оптимизация файлов с нужным расширением из текущей директории
optimizt `find . -type f -name '*.jpg'`
```

## Использование через External Tools в WebStorm

### Добавление инструмента

Перейти в _Preferences → Tools → External Tools_ и добавить новый инструмент со следующими параметрами:

- Name: `Optimize Images`
- Description: `Image optimization tool`
- Program: `Путь до исполняемого файла`
- Arguments: `$FilePath$`
- Working Directory: `$ContentRoot$`
- Synchronize files after execution
- Open console for tool output

![](images/ws_external-tools.png)

### Использование

После добавления вызов утилиты может производиться правой кнопкой при клике на директории или файле с изображением:

![](images/ws_menu.png)

### Горячие клавиши

Для назначения горячих клавиш нужно перейти в _Preferences → Keymap → External Tools_:

![](images/ws_keymap.png)
