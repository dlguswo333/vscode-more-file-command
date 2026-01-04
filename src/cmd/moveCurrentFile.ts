import * as vscode from 'vscode';
import {getAllFoldersInWorkspaceFolder, getFileNameFromPath, getRelativeUriPath} from '@/util';
import strings from '@/strings';

type QuickPickFolderItem = vscode.QuickPickItem & { uri: vscode.Uri };

const moveCurrentFile = async () => {
  const currentFile = vscode.window.activeTextEditor?.document;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(strings.error.couldNotGetWorkspaceFolder);
    return;
  }
  if (!currentFile) {
    vscode.window.showErrorMessage(strings.error.couldNotGetCurrentFile);
    return;
  }
  const currentFileName = getFileNameFromPath(currentFile.fileName);
  if (!currentFileName) {
    vscode.window.showErrorMessage(strings.error.couldNotGetCurrentFileName);
    return;
  }

  const folders = await getAllFoldersInWorkspaceFolder();
  if (!folders) {
    vscode.window.showErrorMessage(strings.error.couldNotGetFoldersInWorkspace);
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
      title: strings.instruction.selectFolderForCurrentFileMove,
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
    vscode.window.showErrorMessage(strings.error.fileWithSameNameExistsInFolder);
  } catch {
    try {
      await vscode.workspace.fs.rename(
        currentFile.uri,
        targetFileUri,
        {overwrite: false}
      );
      vscode.window.showInformationMessage(
        strings.success.movedCurrentFileTo(pickedItem.description + '/' + pickedItem.label)
      );
    } catch {
      vscode.window.showErrorMessage(strings.error.couldNotMoveCurrentFile);
    }
  }
};

const command = vscode.commands.registerCommand('vscode-more-file-command.moveCurrentFile', () => {
  moveCurrentFile().catch(() => {
    vscode.window.showErrorMessage(strings.error.couldNotMoveCurrentFile);
  });
});

export default command;
