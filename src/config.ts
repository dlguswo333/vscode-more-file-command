import * as vscode from 'vscode';

const getConfigValue = (id: string) => {
  return vscode.workspace.getConfiguration('vscode-more-file-command').get(id);
};

export const getShouldIgnoreFoldersInGitignore = () => {
  const value = getConfigValue('ignore.foldersInGitignore') as boolean;

  return value;
};

export const getIgnoreFolderPatterns = () => {
  const rawValue = getConfigValue('ignore.patterns') as string[];
  const value = rawValue.map(raw => {
    try {
      return new RegExp(raw);
    } catch {
      return undefined;
    }
    // Filter out invalid strings.
    // [TODO] Notify users about invalid config items.
  }).filter(val => val !== undefined);

  return value;
};
