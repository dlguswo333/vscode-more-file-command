import {getAllFoldersInWorkspaceFolder, getRelativeUriPath} from '@/util';
import * as vscode from 'vscode';
import strings from '@/strings';

type QuickPickFolderItem = vscode.QuickPickItem & { uri: vscode.Uri };

const createNewFile = async () => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(strings.error.couldNotGetWorkspaceFolder);
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
      title: 'Insert a folder name to move the current file to:',
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
    vscode.window.showErrorMessage(strings.error.couldNotCreateNewFile);
  });
});

export default command;
