import * as vscode from 'vscode';
import ignore from 'ignore';
import {getIgnoreFolderPatterns, getShouldIgnoreFoldersInGitignore} from '@/config';

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

// [TODO] Support multi-root workspace.
/**
 * Get array of `vscode.WorkspaceFolder`s.
 */
export const getWorkspaceFolder = () =>
  vscode.workspace.workspaceFolders?.[0];

export const getUriAvailable = async (uri: vscode.Uri) => {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
};

export const readUriContents = async (uri: vscode.Uri) => {
  const document = await vscode.workspace.openTextDocument(uri);
  return document.getText();
};

/**
 * Returns relative Uri path for pretty printing.
 * @example
 * // Returns 'bar/one/two'
 * getRelativeUriPath(
 *  vscode.Uri.from({scheme: 'file', path: '/foo/bar/one/two'}),
 *  vscode.Uri.from({scheme: 'file', path: '/foo/bar'}),
 * )
 *
 *  * // Returns 'bar'
 * getRelativeUriPath(
 *  vscode.Uri.from({scheme: 'file', path: '/foo/bar'}),
 *  vscode.Uri.from({scheme: 'file', path: '/foo/bar'}),
 * )
 */
export const getRelativeUriPath = (targetUri: vscode.Uri, baseUri: vscode.Uri): string => {
  const lastIndexOfPathSepInBasePath = baseUri.path.lastIndexOf('/');
  const LAST_SEP = /\/$/;
  const baseName = baseUri.path.substring(lastIndexOfPathSepInBasePath + 1).replace(LAST_SEP, '');
  return targetUri.path.replace(baseUri.path, baseName);
};

const gitignoreFileName = '.gitignore';

/**
 * Get all subfolders within `folder` and push them into `retArray`.
 */
const getAllSubFolders = async (
  folder: vscode.Uri,
  retArray: vscode.Uri[],
  ignoreOptions: {foldersInGitignore: boolean; patterns: RegExp[]}
) => {
  const gitignoreUri = vscode.Uri.joinPath(folder, gitignoreFileName);
  const gitignoreExists = await getUriAvailable(gitignoreUri);
  const gitignore = ignore();
  if (ignoreOptions.foldersInGitignore && gitignoreExists) {
    gitignore.add(await readUriContents(gitignoreUri));
  }

  const subFolders = (await vscode.workspace.fs.readDirectory(folder))
    .filter(item => (
      [
        item[1] === vscode.FileType.Directory,
        !(ignoreOptions.foldersInGitignore && gitignoreExists && gitignore.ignores(item[0])),
        !ignoreOptions.patterns.some(pattern => pattern.test(item[0]))
      ]
    ).every(isTruthy));
  const subFolderUris = subFolders.map(subFolder => vscode.Uri.joinPath(folder, subFolder[0]));
  // Push narrow folders first into the array.
  retArray.push(...subFolderUris);
  await Promise.all(
    subFolderUris.map(subFolderUri => getAllSubFolders(
      subFolderUri,
      retArray,
      ignoreOptions
    ))
  );
};

/**
 * Get list of all subfolders inside the workspace folder.
 */
export const getAllFoldersInWorkspaceFolder = async () => {
  const shouldIgnoreFoldersInGitignore = getShouldIgnoreFoldersInGitignore();
  const ignorePatterns = getIgnoreFolderPatterns();
  const workspaceFolder = getWorkspaceFolder();
  if (!workspaceFolder) {
    return undefined;
  }
  const folders = [workspaceFolder.uri];
  await getAllSubFolders(
    folders[0],
    folders,
    {foldersInGitignore: shouldIgnoreFoldersInGitignore, patterns: ignorePatterns}
  );
  return folders;
};
