import * as vscode from 'vscode';

const getConfigValue = (id: string) => {
  return vscode.workspace.getConfiguration('vscode-more-file-command').get(id);
};

export const getShouldIgnoreFoldersInGitignore = () => {
  const value = getConfigValue('ignore.foldersInGitignore') as boolean;

  return value;
};

export const getIgnoreFolderPatterns = () => {
  const rawValues = getConfigValue('ignore.patterns') as string[];
  const invalidRawValues: string[] = [];
  const parseResults = rawValues.map(raw => {
    try {
      return new RegExp(raw);
    } catch {
      // Filter out invalid strings.
      invalidRawValues.push(raw);
      return undefined;
    }
  });

  const patterns = parseResults.filter(val => val !== undefined);
  if (invalidRawValues.length > 0) {
    vscode.window.showWarningMessage(
      `Some of ignore.patterns did not follow RegExp patterns and they are ignored: ${invalidRawValues.map(val => `'${val}'`).join(', ')}`
    );
  }

  return patterns;
};
