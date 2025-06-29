import * as vscode from 'vscode';

export async function applyEdits(document: vscode.TextDocument, edits: vscode.TextEdit[]) {
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

export function updateSelections(document: vscode.TextDocument, edits: vscode.TextEdit[]) {
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

export function logError(error: any, document: vscode.TextDocument, position: vscode.Position) {
	const lineNumber = position.line + 1;
	console.error(`${error} - ${document.fileName}:${lineNumber}:${position.character + 1}`);
}