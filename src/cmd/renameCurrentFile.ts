import * as vscode from 'vscode';
import {getFileNameFromPath} from '../util';

const command = vscode.commands.registerCommand('vscode-more-file-command.renameCurrentFile', () => {
  const currentFile = vscode.window.activeTextEditor?.document;
  if (!currentFile) {
    return;
  }
  const currentFileName = getFileNameFromPath(currentFile.fileName);
  if (!currentFileName) {
    return;
  }

  const inputRes = vscode.window.showInputBox({
    title: 'Insert a new name for the current file:',
    value: currentFileName,
    validateInput: (value) => {
      if (value.includes('/') || value.includes('\\')) {
        return 'Renaming the file name including path separator is not supported.';
      }
      if (!value.trim()) {
        return `Naming the file name as '${value}' is not supported.`;
      }
      return undefined;
    },
  });

  inputRes.then(async (value) => {
    if (!value) {
      return;
    }
    const targetUri = vscode.Uri.joinPath(currentFile.uri, '../', value);
    try {
      // stat will fail if the target uri does not exist.
      await vscode.workspace.fs.stat(targetUri);
      vscode.window.showErrorMessage(`The file name '${value}' already exists.`);
      return;
    } catch {
      try {
        await vscode.workspace.fs.rename(currentFile.uri, targetUri, {overwrite: false});
        vscode.window.showInformationMessage(`Renamed the current file name to '${value}'.`);
      } catch {
        vscode.window.showErrorMessage(`Renaming the current file as '${value}' failed for unknown reasons.`);
      }
    }
  });
});

export default command;
