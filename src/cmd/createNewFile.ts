import * as vscode from 'vscode';

const readDirectory = vscode.workspace.fs.readDirectory;

type QuickPickFolderItem = vscode.QuickPickItem & { uri: vscode.Uri };

const ignoreFolderNamePatterns = [
  /^\./ // Folders that start with '.'
];

const isTruthy = (value: unknown) => !!value;

const getAllSubFolders = async (folder: vscode.Uri, retArray: vscode.Uri[]) => {
  const subFolders = (await readDirectory(folder))
    .filter(item => (
      [
        item[1] === vscode.FileType.Directory,
        !ignoreFolderNamePatterns.some(pattern => pattern.test(item[0]))
      ]
    ).every(isTruthy));
  const subFolderUris = subFolders.map(subFolder => vscode.Uri.joinPath(folder, subFolder[0]));
  // Push narrow folders first into the array.
  retArray.push(...subFolderUris);
  await Promise.all(subFolderUris.map(subFolderUri => getAllSubFolders(subFolderUri, retArray)));
};

const getAllFoldersInWorkspaceFolder = async () => {
  // [TODO] Support multi-root workspace.
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return undefined;
  }
  const folders = [workspaceFolder.uri];
  await getAllSubFolders(folders[0], folders);
  return folders;
};

const createNewFile = async () => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }

  const folders = await getAllFoldersInWorkspaceFolder();
  if (!folders) {
    vscode.window.showErrorMessage('Could not get the folders in the workspace for unknown reasons.');
    return;
  }

  const quickPickItems = folders.map(folder => ({
    label: folder.path.substring(folder.path.lastIndexOf('/') + 1),
    description: folder.path.substring(0, folder.path.lastIndexOf('/')),
    iconPath: vscode.ThemeIcon.Folder,
    uri: folder,
  }));
  const pickedItem = await vscode.window.showQuickPick<QuickPickFolderItem>(
    quickPickItems,
    {
      canPickMany: false,
      title: 'Insert a folder name to move the current file to:',
      matchOnDescription: true,
    }
  );
  if (!pickedItem) {
    return;
  }

  await vscode.commands.executeCommand('revealInExplorer', pickedItem.uri);
  await vscode.commands.executeCommand('explorer.newFile');
};

const command = vscode.commands.registerCommand('vscode-more-file-command.createNewFile', () => {
  createNewFile().catch(() => {
    vscode.window.showErrorMessage('Creating new file failed for unknown reasons.');
  });
});

export default command;
