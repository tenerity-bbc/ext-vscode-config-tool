import * as vscode from 'vscode';
import { encrypt, decrypt } from '../service/configService';
import { ConfigServerManager } from '../service/configServerManager';
import { outputChannel } from '../shared/outputChannel';

const CIPHER_REGEX = /(['\"]?)\{cipher\}([A-Za-z0-9+/]+=*)\1/g;

export async function handleCipherCommand(operation: 'encrypt' | 'decrypt') {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !ConfigServerManager.getInstance().getCurrentServer()) { return; }

	const edits = operation === 'encrypt' 
		? await processEncryption(editor) 
		: await processDecryption(editor);
	
	await applyEdits(editor.document, edits);
}

async function processEncryption(editor: vscode.TextEditor): Promise<vscode.TextEdit[]> {
	const selections = editor.selections.filter(s => !s.isEmpty);
	if (selections.length === 0) {
		vscode.window.showWarningMessage('Please select text to encrypt');
		return [];
	}

	const edits: vscode.TextEdit[] = [];
	for (const selection of selections) {
		const selectedText = editor.document.getText(selection);
		try {
			const encrypted = await encrypt(selectedText);
			const range = new vscode.Range(selection.start, selection.end);
			edits.push(vscode.TextEdit.replace(range, `'{cipher}${encrypted}'`));
		} catch (error) {
			logError(error, editor.document, selection.start);
		}
	}
	return edits;
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
	outputChannel.appendLine(`${error} - ${document.fileName}:${lineNumber}:${position.character + 1}`);
	outputChannel.show();
}