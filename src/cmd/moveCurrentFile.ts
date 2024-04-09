import * as vscode from 'vscode';
import {getFileNameFromPath} from '@/util';

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

const moveCurrentFile = async () => {
  const currentFile = vscode.window.activeTextEditor?.document;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!currentFile || !workspaceFolder) {
    return;
  }
  const currentFileName = getFileNameFromPath(currentFile.fileName);
  if (!currentFileName) {
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

  const targetFileUri = vscode.Uri.joinPath(
    pickedItem.uri,
    currentFileName
  );
  try {
    // stat will fail if the target uri does not exist.
    await vscode.workspace.fs.stat(targetFileUri);
    vscode.window.showErrorMessage('A file with the same name already exists inside the folder.');
  } catch {
    try {
      await vscode.workspace.fs.rename(
        currentFile.uri,
        targetFileUri,
        {overwrite: false}
      );
      vscode.window.showInformationMessage(`Moved the current file to ${pickedItem.description + '/' + pickedItem.label}`);
    } catch {
      vscode.window.showErrorMessage('Failed to move the current file for unknown reasons.');
    }
  }
};

const command = vscode.commands.registerCommand('vscode-more-file-command.moveCurrentFile', () => {
  moveCurrentFile().catch(() => {
    vscode.window.showErrorMessage('Moving the current file failed for unknown reasons.');
  });
});

export default command;
