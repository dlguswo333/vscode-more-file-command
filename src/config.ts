import * as vscode from 'vscode';

const getConfigValue = (id: string) => {
  return vscode.workspace.getConfiguration('vscode-more-file-command').get(id);
};

export const getShouldIgnoreDotFolders = () => {
  const value = getConfigValue('ignore.dotFolders') as boolean;

  return value;
};

export const getShouldIgnoreFoldersInGitignore = () => {
  const value = getConfigValue('ignore.foldersInGitignore') as boolean;

  return value;
};
