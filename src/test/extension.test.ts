import * as assert from 'assert';
import {getFileNameFromPath} from '@/util';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Util test', () => {
    assert.strictEqual(getFileNameFromPath('path/to/file.txt'), 'file.txt');
    assert.strictEqual(getFileNameFromPath('path\\to\\file.txt'), 'file.txt');
  });
});
