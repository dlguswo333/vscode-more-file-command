import * as vscode from 'vscode';
import {getAllFoldersInWorkspaceFolder, getFileNameFromPath, getRelativeUriPath} from '@/util';

type QuickPickFolderItem = vscode.QuickPickItem & { uri: vscode.Uri };

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
    label: getRelativeUriPath(folder, workspaceFolder.uri),
    iconPath: vscode.ThemeIcon.Folder,
    uri: folder,
  }));
  const pickedItem = await vscode.window.showQuickPick<QuickPickFolderItem>(
    quickPickItems,
    {
      canPickMany: false,
      title: 'Insert a folder name to move the current file to:',
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
