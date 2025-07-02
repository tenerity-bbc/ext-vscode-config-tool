import * as vscode from 'vscode';
import { encrypt, decrypt } from '../service/configService';
import { ServerManager } from '../service/serverManager';
import { outputChannel } from '../shared/outputChannel';

const CIPHER_REGEX = /(['\"]?)\{cipher\}([A-Za-z0-9+/]+=*)\1/g;

let currentCancellationTokenSource: vscode.CancellationTokenSource | null = null;

export function cancelCipherOperation() {
	if (currentCancellationTokenSource) {
		currentCancellationTokenSource.cancel();
		vscode.window.showInformationMessage('Cipher operation cancelled');
	}
}

export async function handleCipherCommand(operation: 'encrypt' | 'decrypt') {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !ServerManager.getInstance().getCurrentServer()) { return; }

	// Save original view state
	const originalVisibleRange = editor.visibleRanges[0];

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	const eligibleDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: new vscode.ThemeColor('editor.wordHighlightBackground'),
		border: '2px solid',
		borderColor: new vscode.ThemeColor('editor.wordHighlightBorder')
	});
	const selectionDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
		border: '1px solid',
		borderColor: new vscode.ThemeColor('editor.findMatchBorder')
	});
	currentCancellationTokenSource = new vscode.CancellationTokenSource();
	statusBarItem.show();

	try {
		const processedCount = operation === 'encrypt' 
			? await processEncryption(editor, statusBarItem, eligibleDecorationType, currentCancellationTokenSource.token) 
			: await processDecryption(editor, statusBarItem, eligibleDecorationType, selectionDecorationType, currentCancellationTokenSource.token);
		
		if (processedCount > 0) {
			vscode.window.showInformationMessage(`Successfully processed ${processedCount} value(s)`);
		}
	} finally {
		// Restore original view state
		if (originalVisibleRange) {
			editor.revealRange(originalVisibleRange, vscode.TextEditorRevealType.InCenter);
		}
		
		currentCancellationTokenSource?.dispose();
		currentCancellationTokenSource = null;
		statusBarItem.dispose();
		eligibleDecorationType.dispose();
		selectionDecorationType.dispose();
	}
}

async function processEncryption(editor: vscode.TextEditor, statusBarItem: vscode.StatusBarItem, decorationType: vscode.TextEditorDecorationType, cancellationToken: vscode.CancellationToken): Promise<number> {
	const selections = editor.selections.filter(s => !s.isEmpty);
	if (selections.length === 0) {
		vscode.window.showWarningMessage('Please select text to encrypt');
		return 0;
	}

	const eligibleSelections = selections.filter(s => editor.document.getText(s).trim());
	if (eligibleSelections.length === 0) {
		vscode.window.showInformationMessage('No eligible text found for encryption');
		return 0;
	}

	// Sort selections by position in descending order
	eligibleSelections.sort((a, b) => editor.document.offsetAt(b.start) - editor.document.offsetAt(a.start));

	let processedCount = 0;
	for (let i = 0; i < eligibleSelections.length; i++) {
		if (cancellationToken.isCancellationRequested) {
			break;
		}
		
		statusBarItem.text = `$(sync~spin) Encrypting ${i + 1}/${eligibleSelections.length}`;
		
		const selection = eligibleSelections[i];
		const range = new vscode.Range(selection.start, selection.end);
		editor.setDecorations(decorationType, [range]);
		
		const selectedText = editor.document.getText(selection);
		try {
			const encrypted = await encrypt(selectedText);
			await applyEdit(editor.document, range, `'{cipher}${encrypted}'`);
			processedCount++;
		} catch (error) {
			logError(error, editor.document, selection.start);
		} finally {
			editor.setDecorations(decorationType, []);
		}
	}
	return processedCount;
}

async function processDecryption(editor: vscode.TextEditor, statusBarItem: vscode.StatusBarItem, decorationType: vscode.TextEditorDecorationType, cipherDecorationType: vscode.TextEditorDecorationType, cancellationToken: vscode.CancellationToken): Promise<number> {
	const document = editor.document;
	const selections = editor.selections.length > 1 ? editor.selections : [editor.selection];
	const matches: Array<{match: RegExpExecArray, offset: number}> = [];

	// Find all cipher matches first
	for (const selection of selections) {
		const text = selection.isEmpty ? document.getText() : document.getText(selection);
		const offset = selection.isEmpty ? 0 : document.offsetAt(selection.start);
		let match;
		CIPHER_REGEX.lastIndex = 0;

		while ((match = CIPHER_REGEX.exec(text)) !== null) {
			matches.push({match, offset});
		}
	}

	if (matches.length === 0) {
		vscode.window.showInformationMessage('No eligible cipher text found for decryption');
		return 0;
	}

	// Sort matches by position in descending order
	matches.sort((a, b) => (b.offset + b.match.index) - (a.offset + a.match.index));

	let processedCount = 0;
	for (let i = 0; i < matches.length; i++) {
		if (cancellationToken.isCancellationRequested) {
			break;
		}
		
		statusBarItem.text = `$(sync~spin) Decrypting ${i + 1}/${matches.length}`;
		
		const {match, offset} = matches[i];
		const fullRange = new vscode.Range(
			document.positionAt(offset + match.index),
			document.positionAt(offset + match.index + match[0].length)
		);
		const cipherTextStart = offset + match.index + match[0].indexOf(match[2]);
		const cipherRange = new vscode.Range(
			document.positionAt(cipherTextStart),
			document.positionAt(cipherTextStart + match[2].length)
		);
		editor.setDecorations(decorationType, [fullRange]);
		editor.setDecorations(cipherDecorationType, [cipherRange]);
		
		try {
			const decrypted = await decrypt(match[2]);
			await applyEdit(document, fullRange, decrypted);
			processedCount++;
		} catch (error) {
			logError(error, document, document.positionAt(offset + match.index));
		} finally {
			editor.setDecorations(decorationType, []);
			editor.setDecorations(cipherDecorationType, []);
		}
	}
	return processedCount;
}

async function applyEdit(document: vscode.TextDocument, range: vscode.Range, newText: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.revealRange(range);
	}
	
	const workspaceEdit = new vscode.WorkspaceEdit();
	workspaceEdit.replace(document.uri, range, newText);
	await vscode.workspace.applyEdit(workspaceEdit);
}

function logError(error: any, document: vscode.TextDocument, position: vscode.Position) {
	const lineNumber = position.line + 1;
	outputChannel.appendLine(`${error} - ${document.fileName}:${lineNumber}:${position.character + 1}`);
	outputChannel.show();
}