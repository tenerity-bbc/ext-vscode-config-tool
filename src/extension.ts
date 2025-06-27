import * as vscode from 'vscode';
import { decrypt, encrypt } from './configService';

const CIPHER_REGEX = /(['"]?)\{cipher\}([^\s\n\r}]+)\1/g;

export function activate(context: vscode.ExtensionContext) {
	const encryptCommand = vscode.commands.registerCommand('config-tool.encrypt', handleEncryptCommand);
	const decryptCommand = vscode.commands.registerCommand('config-tool.decrypt', handleDecryptCommand);
	context.subscriptions.push(encryptCommand, decryptCommand);
}

export function deactivate() {}

async function handleEncryptCommand() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const selections = editor.selections.filter(s => !s.isEmpty);
	if (selections.length === 0) {
		vscode.window.showWarningMessage('Please select text to encrypt');
		return;
	}

	for (const selection of selections) {
		const selectedText = editor.document.getText(selection);
		try {
			const encrypted = await encrypt(selectedText);
			await editor.edit(editBuilder => {
				editBuilder.replace(selection, `'{cipher}${encrypted}'`);
			});
		} catch (error) {
			logError(error, editor.document, selection.start);
		}
	}
	vscode.window.showInformationMessage(`Encrypted ${selections.length} values(s)`);
}

async function handleDecryptCommand() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

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
		vscode.window.showInformationMessage(`Decrypted ${edits.length} value(s)`);
	} else {
		vscode.window.showInformationMessage('No {cipher} values found');
	}
}

function logError(error: any, document: vscode.TextDocument, position: vscode.Position) {
	const lineNumber = position.line + 1;
	console.error(`${error} - ${document.fileName}:${lineNumber}:${position.character + 1}`);
}
