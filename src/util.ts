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
