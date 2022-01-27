FROM node:14.18.0-stretch-slim
LABEL maintainer="Andrey Ivanov (https://github.com/343dev)"

WORKDIR /app

COPY . .

ENV NODE_ENV="production"

RUN apt update \
  && apt install --yes --no-install-recommends build-essential libjpeg-dev libpng-dev pkg-config \
  && npm ci \
  && npm link \
  && npm cache clean --force \
  && apt purge --yes build-essential pkg-config \
  && apt autoremove --yes --purge \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man

WORKDIR /src

ENTRYPOINT ["optimizt"]
