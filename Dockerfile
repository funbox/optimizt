FROM node:18.15.0-bullseye-slim

ARG OPTIMIZT_VERSION=latest
ARG BUILD_DATE

LABEL org.opencontainers.image.title="Optimizt" \
      org.opencontainers.image.description="An image to launch \"@funboxteam/optimizt\" npm package" \
      org.opencontainers.image.authors="Andrey Warkentin (https://github.com/343dev)" \
      org.opencontainers.image.vendor="FunBox" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/funbox/optimizt" \
      org.opencontainers.image.version=$OPTIMIZT_VERSION \
      org.opencontainers.artifact.created=$BUILD_DATE

WORKDIR /src

RUN apt update \
  && apt install --yes --no-install-recommends build-essential libpng16-16 libjpeg62-turbo libjpeg62-turbo-dev libpng-dev pkg-config dh-autoreconf \
  && npm install -g --silent @funboxteam/optimizt@${OPTIMIZT_VERSION} \
  && npm cache clean --force \
  && apt purge --yes build-essential pkg-config libpng-dev libjpeg62-turbo-dev dh-autoreconf \
  && apt autoremove --yes --purge \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man

ENTRYPOINT ["optimizt"]
