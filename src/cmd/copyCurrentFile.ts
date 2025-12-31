import * as vscode from 'vscode';
import {getAllFoldersInWorkspaceFolder, getFileNameFromPath, getRelativeUriPath, getUriAvailable} from '@/util';

type QuickPickFolderItem = vscode.QuickPickItem & { uri: vscode.Uri };

const copyCurrentFile = async () => {
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
    label: getRelativeUriPath(folder, workspaceFolder.uri),
    iconPath: vscode.ThemeIcon.Folder,
    uri: folder,
  }));
  const pickedItem = await vscode.window.showQuickPick<QuickPickFolderItem>(
    quickPickItems,
    {
      canPickMany: false,
      title: 'Select a folder to copy the current file to:',
    }
  );
  if (!pickedItem) {
    return;
  }

  const destFileName = await vscode.window.showInputBox({
    title: 'Insert the new file name:',
    value: currentFileName,
  });
  if (!destFileName) {
    return;
  }

  const currentFileUri = currentFile.uri;
  const destFileUri = vscode.Uri.joinPath(
    pickedItem.uri,
    destFileName
  );
  if (await getUriAvailable(destFileUri)) {
    vscode.window.showErrorMessage('The file already exists.');
    return;
  }
  await vscode.workspace.fs.copy(currentFileUri, destFileUri, {overwrite: false});
};

const command = vscode.commands.registerCommand('vscode-more-file-command.copyCurrentFile', () => {
  copyCurrentFile().catch((e) => {
    console.error('copyCurrentFile error:');
    console.error(e);
    vscode.window.showErrorMessage('Copying the current file failed for unknown reasons.');
  });
});

export default command;
