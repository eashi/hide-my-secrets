// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yamlParser from 'yaml-ast-parser';
import { YAMLScalar, Kind, YAMLMapping, YAMLNode } from 'yaml-ast-parser';

const secretDecorationType = vscode.window.createTextEditorDecorationType({ backgroundColor: 'red', color: 'red' });
// let hide = true;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let config = vscode.workspace.getConfiguration();
	let hide = config.get("hide-my-secret.hide") as boolean;
	//TODO: check configuration, if true then call function, otherwise don't do anything
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		FindRangesAndDecorate(editor, hide);
	}

	console.log('Congratulations, your extension "hide-my-secret" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('hide-my-secret.HideUnhideSecrets', async () => {

		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			let config = vscode.workspace.getConfiguration();
			hide = !config.get("hide-my-secret.hide") as boolean;
			await config.update("hide-my-secret.hide", hide, vscode.ConfigurationTarget.Global);
			FindRangesAndDecorate(editor, hide);
		}
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from hide-my-secret!');

	});

	context.subscriptions.push(disposable);
}

function FindRangesAndDecorate(editor: vscode.TextEditor, hide: boolean) {
	if (hide) {
		let secretRanges: vscode.Range[] = [];
		const document = editor.document;
		let parsed = yamlParser.load(document.getText());
		console.log(parsed);
		traverseAndChange(parsed, editor, secretRanges);

		setDecoration(editor, secretRanges);
	}
	else {
		editor.setDecorations(secretDecorationType, []);
	}
}

function traverseAndChange(node: yamlParser.YAMLNode, editor: vscode.TextEditor, ranges: vscode.Range[]) {

	if (node.kind === Kind.MAP) {
		for (let childNode of node.mappings) {
			traverseAndChange(childNode, editor, ranges);
		}
	} else {
		if (node.kind === Kind.MAPPING) { //it's an object (key : object)
			let keyValue = node.key.value;
			if (keyValue === "app") {
				addSecretRange(node.value, editor, ranges);
			} else {
				if (node.value.kind === Kind.MAP) { //it's a mapping, it has a property called mappings (applies to Root)
					for (let childNode of node.value.mappings) {
						traverseAndChange(childNode, editor, ranges);
					}
				} else if (node.value.kind === Kind.SEQ) { // it's sequence 
					for (let childNode of node.value.items) {
						traverseAndChange(childNode, editor, ranges);
					}
				}
			}
		}
	}

}

function addSecretRange(scalar: YAMLNode, editor: vscode.TextEditor, ranges: vscode.Range[]) {
	ranges.push(new vscode.Range(editor.document.positionAt(scalar.startPosition), editor.document.positionAt(scalar.endPosition)));
}

function setDecoration(editor: vscode.TextEditor, ranges: vscode.Range[]) {
	editor.setDecorations(secretDecorationType, ranges);
}
// this method is called when your extension is deactivated
export function deactivate() { }
