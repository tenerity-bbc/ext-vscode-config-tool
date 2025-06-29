import * as vscode from 'vscode';
import { handleEncryptCommand, handleDecryptCommand } from './command/cipher';

export function activate(context: vscode.ExtensionContext) {
	const encryptCommand = vscode.commands.registerCommand('config-tool.encrypt', handleEncryptCommand);
	const decryptCommand = vscode.commands.registerCommand('config-tool.decrypt', handleDecryptCommand);
	context.subscriptions.push(encryptCommand, decryptCommand);
}

export function deactivate() {}