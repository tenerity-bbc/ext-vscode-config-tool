import * as vscode from 'vscode';
import { handleEncryptCommand, handleDecryptCommand } from './command/cipher';
import { ConfigServerManager } from './service/configServerManager';

export function activate(context: vscode.ExtensionContext) {
	const configServerManager = ConfigServerManager.getInstance();
	
	const encryptCommand = vscode.commands.registerCommand('config-tool.encrypt', handleEncryptCommand);
	const decryptCommand = vscode.commands.registerCommand('config-tool.decrypt', handleDecryptCommand);
	const selectServerCommand = vscode.commands.registerCommand('config-tool.selectServer', () => configServerManager.selectServer());
	const pinServerCommand = vscode.commands.registerCommand('config-tool.pinServer', () => configServerManager.pinCurrentServer());
	const unpinServerCommand = vscode.commands.registerCommand('config-tool.unpinServer', () => configServerManager.unpinServer());

	context.subscriptions.push(encryptCommand, decryptCommand, selectServerCommand, pinServerCommand, unpinServerCommand, configServerManager);
}

export function deactivate() {}