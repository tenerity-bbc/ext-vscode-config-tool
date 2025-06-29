import * as vscode from 'vscode';
import { encrypt } from '../../service/configService';
import { applyEdits, logError } from './commonUtils';

export async function handleEncryptCommand() {
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

