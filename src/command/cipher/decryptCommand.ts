import * as vscode from 'vscode';
import { decrypt } from '../../service/configClient';
import { applyEdits, logError } from './commonUtils';
import { ConfigServerManager } from '../../service/configServerManager';

const CIPHER_REGEX = /(['"]?)\{cipher\}([A-Za-z0-9+/]+=*)\1/g;

export async function handleDecryptCommand() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !ConfigServerManager.getInstance().getCurrentServer()) { return; }

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

