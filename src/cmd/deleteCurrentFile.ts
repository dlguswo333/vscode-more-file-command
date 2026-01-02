import * as vscode from 'vscode';
import {getFileNameFromPath} from '@/util';

const DELETE_PERMANENTLY = 'Delete Permanently';

const command = vscode.commands.registerCommand('vscode-more-file-command.deleteCurrentFile', () => {
  const currentFile = vscode.window.activeTextEditor?.document;
  if (!currentFile) {
    vscode.window.showErrorMessage('Could not get the current file opened.');
    return;
  }
  const currentFileName = getFileNameFromPath(currentFile.fileName);
  if (!currentFileName) {
    vscode.window.showErrorMessage('Could not get the current file name.');
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
      vscode.window.showErrorMessage('Deleting the current file failed for unknown reasons.');
    }
  });
});

export default command;
