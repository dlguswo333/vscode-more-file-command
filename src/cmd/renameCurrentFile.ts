import * as vscode from 'vscode';
import {getFileNameFromPath} from '@/util';
import strings from '@/strings';

const command = vscode.commands.registerCommand('vscode-more-file-command.renameCurrentFile', () => {
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

  const inputRes = vscode.window.showInputBox({
    title: 'Insert a new name for the current file:',
    value: currentFileName,
    validateInput: (value) => {
      if (value.includes('/') || value.includes('\\')) {
        return strings.error.cannotRenameWithPathSep;
      }
      if (!value.trim()) {
        return strings.error.cannotNameFileInName(value);
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
      vscode.window.showErrorMessage(strings.error.fileWithSameNameExists(value));
      return;
    } catch {
      try {
        await vscode.workspace.fs.rename(currentFile.uri, targetUri, {overwrite: false});
        vscode.window.showInformationMessage(strings.success.renamedTheFileToName(value));
      } catch {
        vscode.window.showErrorMessage(strings.error.couldNotRenameCurrentFileInName(value));
      }
    }
  });
});

export default command;
