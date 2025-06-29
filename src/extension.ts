import * as vscode from 'vscode';
import { decrypt, encrypt } from './configService';

const CIPHER_REGEX = /(['"]?)\{cipher\}([A-Za-z0-9+/]+=*)\1/g;

export function activate(context: vscode.ExtensionContext) {
	const encryptCommand = vscode.commands.registerCommand('config-tool.encrypt', handleEncryptCommand);
	const decryptCommand = vscode.commands.registerCommand('config-tool.decrypt', handleDecryptCommand);
	context.subscriptions.push(encryptCommand, decryptCommand);
}

export function deactivate() {}

async function handleEncryptCommand() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {return;}

	const selections = editor.selections.filter(s => !s.isEmpty);
	if (selections.length === 0) {
		vscode.window.showWarningMessage('Please select text to encrypt');
		return;
	}

	const edits = await processEncryption(editor, selections);
	await applyEdits(editor.document, edits);
}

async function processEncryption(editor: vscode.TextEditor, selections: vscode.Selection[]): Promise<vscode.TextEdit[]> {
	const document = editor.document;
	const edits: vscode.TextEdit[] = [];

	for (const selection of selections) {
		const selectedText = document.getText(selection);
		try {
			const encrypted = await encrypt(selectedText);
			const range = new vscode.Range(selection.start, selection.end);
			edits.push(vscode.TextEdit.replace(range, `'{cipher}${encrypted}'`));
		} catch (error) {
			logError(error, document, selection.start);
		}
	}
	return edits;
}

async function handleDecryptCommand() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {return;}

	const edits = await processDecryption(editor);
	await applyEdits(editor.document, edits);
}

async function processDecryption(editor: vscode.TextEditor): Promise<vscode.TextEdit[]> {
	const document = editor.document;
	const selections = editor.selections.length > 1 ? editor.selections : [editor.selection];
	const edits: vscode.TextEdit[] = [];

	for (const selection of selections) {
		const text = selection.isEmpty ? document.getText() : document.getText(selection);
		const offset = selection.isEmpty ? 0 : document.offsetAt(selection.start);
		let match;

		while ((match = CIPHER_REGEX.exec(text)) !== null) {
			try {
				const decrypted = await decrypt(match[2]);
				const range = new vscode.Range(
					document.positionAt(offset + match.index),
					document.positionAt(offset + match.index + match[0].length)
				);
				edits.push(vscode.TextEdit.replace(range, decrypted));
			} catch (error) {
				logError(error, document, document.positionAt(offset + match.index));
			}
		}
	}
	return edits;
}

async function applyEdits(document: vscode.TextDocument, edits: vscode.TextEdit[]) {
	if (edits.length > 0) {
		const workspaceEdit = new vscode.WorkspaceEdit();
		workspaceEdit.set(document.uri, edits);
		await vscode.workspace.applyEdit(workspaceEdit);
		updateSelections(document, edits);
		vscode.window.showInformationMessage(`Processed ${edits.length} value(s)`);
	} else {
		vscode.window.showInformationMessage('No values found');
	}
}

function updateSelections(document: vscode.TextDocument, edits: vscode.TextEdit[]) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const newSelections = edits.map(edit => {
			const start = edit.range.start;
			const end = document.positionAt(
				document.offsetAt(start) + edit.newText.length
			);
			return new vscode.Selection(start, end);
		});
		editor.selections = newSelections;
	}
}

function logError(error: any, document: vscode.TextDocument, position: vscode.Position) {
	const lineNumber = position.line + 1;
	console.error(`${error} - ${document.fileName}:${lineNumber}:${position.character + 1}`);
}
