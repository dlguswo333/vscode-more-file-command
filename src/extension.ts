// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import renameCurrentFileCmd from './cmd/renameCurrentFile';

export function activate (context: vscode.ExtensionContext) {
  console.log('The Extension "vscode-more-file-command" is now active.');

  context.subscriptions.push(renameCurrentFileCmd);
}

// This method is called when your extension is deactivated
export function deactivate () {
  console.log('The Extension "vscode-more-file-command" is now deactivated.');
}
