// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yamlParser from 'yaml-ast-parser';
import { YAMLScalar, Kind, YAMLMapping, YAMLNode } from 'yaml-ast-parser';

let secretDecorationType = vscode.window.createTextEditorDecorationType({ backgroundColor: 'red', color: 'red' });

export function activate(context: vscode.ExtensionContext) {

	vscode.window.onDidChangeActiveTextEditor(e => {
	
	let config = vscode.workspace.getConfiguration();
	let hide = config.get("hide-my-secrets.hide") as boolean;
	let secretKeys = config.get("hide-my-secrets.secretKeys") as string[];
	let redactColor = config.get("hide-my-secrets.redactColor") as string;

	secretDecorationType = 
		vscode.window.createTextEditorDecorationType({
			backgroundColor: redactColor, 
			color: redactColor
		});

	let editor = vscode.window.activeTextEditor;
		if(editor) {
			FindRangesAndDecorate(editor, hide, secretKeys);
		}
	});


	let config = vscode.workspace.getConfiguration();
	let hide = config.get("hide-my-secrets.hide") as boolean;
	let secretKeys = config.get("hide-my-secrets.secretKeys") as string[];
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		FindRangesAndDecorate(editor, hide, secretKeys);
	}

	console.log('Congratulations, your extension "hide-my-secrets" is now active!');

	let disposable = vscode.commands.registerCommand('hide-my-secrets.HideUnhideSecrets', async () => {

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			let config = vscode.workspace.getConfiguration();
			hide = !config.get("hide-my-secrets.hide") as boolean;
			await config.update("hide-my-secrets.hide", hide, vscode.ConfigurationTarget.Global);
		
			let secretKeys = config.get("hide-my-secrets.secretKeys") as string[];

			FindRangesAndDecorate(editor, hide, secretKeys);
		}
	});

	context.subscriptions.push(disposable);
}

function FindRangesAndDecorate(editor: vscode.TextEditor, hide: boolean, secretKeys: string[]) {
	if (hide) {
		let secretRanges: vscode.Range[] = [];
		const document = editor.document;
		let parsed = yamlParser.load(document.getText());
		console.log(parsed);
		traverseAndChange(parsed, editor, secretRanges, secretKeys);

		setDecoration(editor, secretRanges);
	}
	else {
		editor.setDecorations(secretDecorationType, []);
	}
}

export function traverseAndChange(node: yamlParser.YAMLNode, editor: vscode.TextEditor, ranges: vscode.Range[], secretKeys: string[]) {

	let testRegEx = new RegExp(secretKeys.join("|"), "i");

	if (node.kind === Kind.MAP) {
		for (let childNode of node.mappings) {
			traverseAndChange(childNode, editor, ranges, secretKeys);
		}
	} else {
		if (node.kind === Kind.MAPPING) { //it's an object (key : object)
			let keyValue = node.key.value;
			if (testRegEx.test(keyValue)) {
				addSecretRange(node.value, editor, ranges);
			} else {
				if (node.value.kind === Kind.MAP) { //it's a mapping, it has a property called mappings (applies to Root)
					for (let childNode of node.value.mappings) {
						traverseAndChange(childNode, editor, ranges, secretKeys);
					}
				} else if (node.value.kind === Kind.SEQ) { // it's sequence 
					for (let childNode of node.value.items) {
						traverseAndChange(childNode, editor, ranges, secretKeys);
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
