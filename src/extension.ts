import * as vscode from 'vscode';
import { handleCipherCommand } from './commands/cipher';
import { ConfigServerManager } from './service/configServerManager';

export function activate(context: vscode.ExtensionContext) {
	const configServerManager = ConfigServerManager.getInstance();
	
	const encryptCommand = vscode.commands.registerCommand('config-tool.encrypt', () => handleCipherCommand('encrypt'));
	const decryptCommand = vscode.commands.registerCommand('config-tool.decrypt', () => handleCipherCommand('decrypt'));
	const selectServerCommand = vscode.commands.registerCommand('config-tool.selectServer', () => configServerManager.selectServer());
	const pinServerCommand = vscode.commands.registerCommand('config-tool.pinServer', () => configServerManager.pinCurrentServer());
	const unpinServerCommand = vscode.commands.registerCommand('config-tool.unpinServer', () => configServerManager.unpinServer());

	context.subscriptions.push(encryptCommand, decryptCommand, selectServerCommand, pinServerCommand, unpinServerCommand, configServerManager);
}

export function deactivate() {}