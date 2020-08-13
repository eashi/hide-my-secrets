import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';
import * as yamlParser from 'yaml-ast-parser';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', async () => {
		let testSuitePath = "/../../../src/test/suite/";
		let document = await vscode.workspace.openTextDocument(__dirname + testSuitePath + "test-yaml.yaml");
		let editor = await vscode.window.showTextDocument(document);

		let parsed = yamlParser.load(editor.document.getText());

		let range: vscode.Range[] = [];
		let secretKeys = ["scalerAddress"];
		myExtension.traverseAndChange(parsed, editor, range, secretKeys);

		let myrange = new vscode.Range(editor.document.positionAt(252), editor.document.positionAt(269));
		assert.equal(range.length, 1);
		assert.deepEqual(range[0], myrange);


	});
});
