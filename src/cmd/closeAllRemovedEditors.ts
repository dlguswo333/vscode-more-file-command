import * as vscode from 'vscode';

const command = vscode.commands.registerCommand('vscode-more-file-command.closeAllRemovedEditors', async () => {
  let didFail: boolean = false;

  await Promise.allSettled(vscode.window.tabGroups.all.map(tabGroup => {
    return Promise.allSettled(tabGroup.tabs.map(async (tab) => {
      if (
        tab.isDirty ||
        tab.isPinned
      ) {
        return;
      }
      if (!(
        tab.input instanceof vscode.TabInputText ||
        tab.input instanceof vscode.TabInputCustom ||
        tab.input instanceof vscode.TabInputNotebook
      )) {
        return;
      }

      const uri = tab.input.uri;
      try {
        await vscode.workspace.fs.stat(uri);
      } catch {
        // If stat fails, that means the file does not exist.
        try {
          await vscode.window.tabGroups.close(tab);
        } catch {
          didFail = true;
        }
      }
    }));
  }));

  if (didFail) {
    vscode.window.showErrorMessage('Failed to close some removed editors for unknown reasons');
  } else {
    vscode.window.showErrorMessage('Closed all removed editors.');
  }
});

export default command;
