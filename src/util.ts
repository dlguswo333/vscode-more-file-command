import * as vscode from 'vscode';

/**
 * Get file name from fs path.
 * @example
 * // Returns 'file.txt'
 * getFileNameFromPath('path/to/file.txt')
 */
export const getFileNameFromPath = (filePath: string): string | undefined => {
  const PATH_SEP = /[/\\]/;
  const fileName = filePath.split(PATH_SEP).at(-1);
  return fileName;
};

const isTruthy = (value: unknown) => !!value;

const ignoreFolderNamePatterns = [
  /^\./ // Folders that start with '.'
];

/**
 * Get all subfolders within `folder` and push them into `retArray`.
 */
const getAllSubFolders = async (folder: vscode.Uri, retArray: vscode.Uri[]) => {
  const subFolders = (await vscode.workspace.fs.readDirectory(folder))
    .filter(item => (
      [
        item[1] === vscode.FileType.Directory,
        !ignoreFolderNamePatterns.some(pattern => pattern.test(item[0]))
      ]
    ).every(isTruthy));
  const subFolderUris = subFolders.map(subFolder => vscode.Uri.joinPath(folder, subFolder[0]));
  // Push narrow folders first into the array.
  retArray.push(...subFolderUris);
  await Promise.all(subFolderUris.map(subFolderUri => getAllSubFolders(subFolderUri, retArray)));
};

/**
 * Get list of all subfolders inside the workspace folder.
 */
export const getAllFoldersInWorkspaceFolder = async () => {
  // [TODO] Support multi-root workspace.
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return undefined;
  }
  const folders = [workspaceFolder.uri];
  await getAllSubFolders(folders[0], folders);
  return folders;
};
