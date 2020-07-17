// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yamlParser from 'yaml-ast-parser';
import { YAMLScalar } from 'yaml-ast-parser';

const secretDecorationType = vscode.window.createTextEditorDecorationType({ backgroundColor: 'red', color: 'red' });

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "hide-my-secret" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	//TODO: Change the command name from "helloWorld" to "somethingElse *grin*"
	let disposable = vscode.commands.registerCommand('hide-my-secret.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (editor) {

			let secretRanges: vscode.Range[] = [];
			const document = editor.document;
			let parsed = yamlParser.load(document.getText());
			console.log(parsed);
			traverseAndChange(parsed, editor, secretRanges);

			setDecoration(editor, secretRanges);
		}
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from hide-my-secret!');
	});

	context.subscriptions.push(disposable);
}

function traverseAndChange(node: yamlParser.YAMLNode, editor: vscode.TextEditor, ranges: vscode.Range[]) {
	
	if(node.kind === 2) {
		for(let childNode of node.mappings) {
			traverseAndChange(childNode, editor, ranges);
		}
		
	} 
	{
		if (node.kind === 1) { //it's an object (key : object)
			let keyValue = node.key.value;
			if (node.value.kind === 2 ){ //it's a mapping, it has a property called mappings (applies to Root)
				for(let childNode of node.value.mappings) {
					traverseAndChange(childNode, editor, ranges);
				}
			} else if (node.value.kind === 3 ) { // it's sequence 

			} else if (node.value.kind === 0 && keyValue === "app") {
				var scalar = node.value as YAMLScalar;
				addSecretRange(scalar, editor, ranges);
			}
		}
	}

}

function addSecretRange(scalar: YAMLScalar, editor: vscode.TextEditor, ranges: vscode.Range[]) {
	ranges.push(new vscode.Range( editor.document.positionAt(scalar.startPosition), editor.document.positionAt(scalar.endPosition)));
}

function setDecoration(editor: vscode.TextEditor, ranges: vscode.Range[]){
	editor.setDecorations(secretDecorationType, ranges);
}
// this method is called when your extension is deactivated
export function deactivate() {}
