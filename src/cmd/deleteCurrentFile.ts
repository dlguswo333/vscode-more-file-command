import * as vscode from 'vscode';
import {getFileNameFromPath} from '@/util';
import strings from '@/strings';

const DELETE_PERMANENTLY = 'Delete Permanently';

const command = vscode.commands.registerCommand('vscode-more-file-command.deleteCurrentFile', () => {
  const currentFile = vscode.window.activeTextEditor?.document;
  if (!currentFile) {
    vscode.window.showErrorMessage(strings.error.couldNotGetCurrentFile);
    return;
  }
  const currentFileName = getFileNameFromPath(currentFile.fileName);
  if (!currentFileName) {
    vscode.window.showErrorMessage(strings.error.couldNotGetCurrentFileName);
    return;
  }

  const inputRes = vscode.window.showWarningMessage(
    `Are you sure to delete the current file: '${currentFileName}'?`,
    {modal: true},
    DELETE_PERMANENTLY
  );

  inputRes.then(async (value) => {
    if (value !== DELETE_PERMANENTLY) {
      return;
    }
    try {
      await vscode.workspace.fs.delete(currentFile.uri, {
        recursive: false, useTrash: false,
      });
    } catch (e) {
      console.log(e);
      vscode.window.showErrorMessage(strings.error.couldNotDeleteCurrentFile);
    }
  });
});

export default command;
