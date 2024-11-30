# Package vsix file.
FROM node:20-alpine AS package-stage

WORKDIR /usr/app
RUN npm i -g @vscode/vsce

COPY ./package.json ./package-lock.json /usr/app/

RUN npm i

COPY ./ /usr/app

RUN vsce package


# Export vsix file to the host machine.
FROM scratch AS export-stage

COPY --from=package-stage /usr/app/*.vsix /
