FROM node:18.15.0-bullseye-slim
LABEL maintainer="Andrey Warkentin (https://github.com/343dev)"

WORKDIR /app

COPY . .

ENV NODE_ENV="production"

RUN apt update \
  && apt install --yes --no-install-recommends build-essential libpng16-16 libjpeg62-turbo libjpeg62-turbo-dev libpng-dev pkg-config dh-autoreconf \
  && npm ci \
  && npm link \
  && npm cache clean --force \
  && apt purge --yes build-essential pkg-config libpng-dev libjpeg62-turbo-dev dh-autoreconf \
  && apt autoremove --yes --purge \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man

WORKDIR /src

ENTRYPOINT ["optimizt"]
