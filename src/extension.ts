import * as vscode from 'vscode';
import { decrypt, encrypt } from './configService';

const CIPHER_REGEX = /(['"]?)\{cipher\}([^\s\n\r}]+)\1/g;

export function activate(context: vscode.ExtensionContext) {
	const decryptCommand = vscode.commands.registerCommand('config-tool.decrypt', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const document = editor.document;
		const selection = editor.selection;
		const text = selection.isEmpty ? document.getText() : document.getText(selection);
		const offset = selection.isEmpty ? 0 : document.offsetAt(selection.start);

		let match;
		const edits: vscode.TextEdit[] = [];

		while ((match = CIPHER_REGEX.exec(text)) !== null) {
			const ciphertext = match[2];
			try {
				const decrypted = await decrypt(ciphertext);
				const range = new vscode.Range(
					document.positionAt(offset + match.index),
					document.positionAt(offset + match.index + match[0].length)
				);
				edits.push(vscode.TextEdit.replace(range, decrypted));
			} catch (error) {
				const position = document.positionAt(offset + match.index);
				const lineNumber = position.line + 1;
				console.error(`${error} - ${document.fileName}:${lineNumber}:${position.character + 1}`);
			}
		}

		if (edits.length > 0) {
			const workspaceEdit = new vscode.WorkspaceEdit();
			workspaceEdit.set(document.uri, edits);
			await vscode.workspace.applyEdit(workspaceEdit);
			vscode.window.showInformationMessage(`Decrypted ${edits.length} value(s)`);
		} else {
			vscode.window.showInformationMessage('No {cipher} values found');
		}
	});

	const encryptCommand = vscode.commands.registerCommand('config-tool.encrypt', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showWarningMessage('Please select text to encrypt');
			return;
		}

		const selectedText = editor.document.getText(selection);
		try {
			const encrypted = await encrypt(selectedText);
			await editor.edit(editBuilder => {
				editBuilder.replace(selection, `'{cipher}${encrypted}'`);
			});
			vscode.window.showInformationMessage('Text encrypted successfully');
		} catch (error) {
			const lineNumber = selection.start.line + 1;
			console.error(`${error} - ${editor.document.fileName}:${lineNumber}:${selection.start.character + 1}`);
		}
	});

	context.subscriptions.push(decryptCommand, encryptCommand);
}

export function deactivate() {}
