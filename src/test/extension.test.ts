import * as assert from 'assert';
import {getFileNameFromPath, getRelativeUriPath} from '@/util';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Util getFileNameFromPath:', () => {
    assert.strictEqual(getFileNameFromPath('path/to/file.txt'), 'file.txt');
    assert.strictEqual(getFileNameFromPath('path\\to\\file.txt'), 'file.txt');
  });

  test('Util getRelativeUriPath:', () => {
    const Uri = vscode.Uri;

    assert.strictEqual(
      getRelativeUriPath(
        Uri.from({scheme: 'file', path: '/foo/bar/one/two'}),
        Uri.from({scheme: 'file', path: '/foo/bar'})
      ),
      'bar/one/two'
    );
    assert.strictEqual(
      getRelativeUriPath(
        Uri.from({scheme: 'file', path: '/foo/bar'}),
        Uri.from({scheme: 'file', path: '/foo/bar'})
      ),
      'bar'
    );
  });
});
