# Package Manager
This repository uses npm as package manager.
originally used pnpm but vsce does not support offcially as of early 2024, thus we switched to npm.
Check out the link for more: https://github.com/microsoft/vscode-vsce/issues/421

# Build
Run the command to build a redistributable `vsix` file.
```shell
npm install -g @vscode/vsce
vsce package
```

## Build With Dockerfile
There is a Dockerfile in the repository to help you build in a replayable, sandboxed environment.
Build the image and a resultant `.vsix` file will be stored in the built image.

To export the `.vsix` file into the host filesystem, run the following command:
```shell
docker build --output=. --target=export-stage .
```
