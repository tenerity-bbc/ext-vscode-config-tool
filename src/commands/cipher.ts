import * as vscode from 'vscode';
import { encrypt, decrypt, ConfigServiceError } from '../service/configService';
import { ServerManager } from '../service/serverManager';
import { logger } from '../shared/logger';

type ProcessingResult = {
	processed: number;
	total: number;
};

const CIPHER_REGEX = /(['\"]?)\{cipher\}([A-Za-z0-9+/]+=*)\1/g;

let currentCancellationTokenSource: vscode.CancellationTokenSource | null = null;

export function cancelCipherOperation() {
	if (currentCancellationTokenSource) {
		currentCancellationTokenSource.cancel();
	}
}

export async function handleCipherCommand(operation: 'encrypt' | 'decrypt') {
	logger.info(`Starting ${operation} operation - let's transform some secrets!`);
	const editor = vscode.window.activeTextEditor;
	if (!editor || !ServerManager.getInstance().getCurrentServer()) { 
		logger.error(`${operation} operation aborted - missing editor or server (need both to work magic!)`);
		return; 
	}

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
		const result = operation === 'encrypt' 
			? await processEncryption(editor, statusBarItem, eligibleDecorationType, currentCancellationTokenSource.token) 
			: await processDecryption(editor, statusBarItem, eligibleDecorationType, selectionDecorationType, currentCancellationTokenSource.token);
		
		logger.info(`${operation} mission accomplished: ${result.processed}/${result.total} secrets transformed!`);
		showOperationResult(result, currentCancellationTokenSource.token.isCancellationRequested);
	} catch (error) {
		if (!currentCancellationTokenSource.token.isCancellationRequested) {
			vscode.window.showErrorMessage(`Operation failed: ${(error as Error).message}`);
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

async function processEncryption(editor: vscode.TextEditor, statusBarItem: vscode.StatusBarItem, decorationType: vscode.TextEditorDecorationType, cancellationToken: vscode.CancellationToken): Promise<ProcessingResult> {
	const selections = editor.selections.filter(s => !s.isEmpty);
	if (selections.length === 0) {
		return { processed: 0, total: 0 };
	}

	const eligibleSelections = selections.filter(s => editor.document.getText(s).trim());
	if (eligibleSelections.length === 0) {
		return { processed: 0, total: 0 };
	}

	// Sort selections by position in descending order
	eligibleSelections.sort((a, b) => editor.document.offsetAt(b.start) - editor.document.offsetAt(a.start));

	const newSelections: vscode.Selection[] = [];
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
			const newText = `'{cipher}${encrypted}'`;
			await applyEdit(editor.document, range, newText);
			newSelections.unshift(new vscode.Selection(range.start, range.start.translate(0, newText.length)));
			processedCount++;
		} catch (error) {
			logError(error, editor.document, selection.start);
			if (error instanceof ConfigServiceError && error.isFatal) {
				throw error;
			}
		} finally {
			editor.setDecorations(decorationType, []);
		}
	}
	if (newSelections.length > 0) {
		editor.selections = newSelections;
	}
	return { processed: processedCount, total: eligibleSelections.length };
}

async function processDecryption(editor: vscode.TextEditor, statusBarItem: vscode.StatusBarItem, decorationType: vscode.TextEditorDecorationType, cipherDecorationType: vscode.TextEditorDecorationType, cancellationToken: vscode.CancellationToken): Promise<ProcessingResult> {
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
		return { processed: 0, total: 0 };
	}

	// Sort matches by position in descending order
	matches.sort((a, b) => (b.offset + b.match.index) - (a.offset + a.match.index));

	const newSelections: vscode.Selection[] = [];
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
			newSelections.unshift(new vscode.Selection(fullRange.start, fullRange.start.translate(0, decrypted.length)));
			processedCount++;
		} catch (error) {
			logError(error, document, document.positionAt(offset + match.index));
			if (error instanceof ConfigServiceError && error.isFatal) {
				throw error;
			}
		} finally {
			editor.setDecorations(decorationType, []);
			editor.setDecorations(cipherDecorationType, []);
		}
	}
	if (newSelections.length > 0) {
		editor.selections = newSelections;
	}
	return { processed: processedCount, total: matches.length };
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

function showOperationResult(result: ProcessingResult, wasCancelled: boolean) {
	if (result.total === 0) {
		vscode.window.showInformationMessage(wasCancelled ? 'Cancelled 👍' : 'Nothing to process 🤷');
	} else if (wasCancelled) {
		vscode.window.showInformationMessage(`Cancelled (${result.processed}/${result.total} done) 😅`);
	} else if (result.processed === result.total) {
		vscode.window.showInformationMessage(`Done! ${result.processed}/${result.total} ✨`);
	} else {
		vscode.window.showWarningMessage(`${result.processed}/${result.total} (${result.total - result.processed} failed) 😅`);
	}
}

function logError(error: any, document: vscode.TextDocument, position: vscode.Position) {
	const lineNumber = position.line + 1;
	logger.error(`Operation failed: ${error} at ${document.fileName}:${lineNumber}:${position.character + 1} - check this spot for issues`);
	logger.show();
}