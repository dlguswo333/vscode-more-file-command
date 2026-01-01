// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import renameCurrentFileCmd from '@/cmd/renameCurrentFile';
import moveCurrentFileCmd from '@/cmd/moveCurrentFile';
import createNewFileCmd from '@/cmd/createNewFile';
import deleteCurrentFileCmd from '@/cmd/deleteCurrentFile';
import closeAllRemovedEditorsCmd from '@/cmd/closeAllRemovedEditors';
import copyCurrentFileCmd from '@/cmd/copyCurrentFile';

export function activate (context: vscode.ExtensionContext) {
  console.log('The Extension "vscode-more-file-command" is now active.');

  context.subscriptions.push(renameCurrentFileCmd);
  context.subscriptions.push(moveCurrentFileCmd);
  context.subscriptions.push(createNewFileCmd);
  context.subscriptions.push(deleteCurrentFileCmd);
  context.subscriptions.push(closeAllRemovedEditorsCmd);
  context.subscriptions.push(copyCurrentFileCmd);
}

// This method is called when your extension is deactivated
export function deactivate () {
  console.log('The Extension "vscode-more-file-command" is now deactivated.');
}
