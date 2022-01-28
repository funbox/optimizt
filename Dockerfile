FROM node:14.18.0-stretch-slim
LABEL maintainer="Andrey Ivanov (https://github.com/343dev)"

WORKDIR /app

COPY . .

ENV NODE_ENV="production"

RUN apt update \
  && apt install --yes --no-install-recommends build-essential libpng16-16 libjpeg62-turbo libjpeg62-turbo-dev libpng-dev pkg-config \
  && npm ci \
  && npm link \
  && npm cache clean --force \
  && apt purge --yes build-essential pkg-config libpng-dev libjpeg62-turbo-dev \
  && apt autoremove --yes --purge \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man

WORKDIR /src

ENTRYPOINT ["optimizt"]
