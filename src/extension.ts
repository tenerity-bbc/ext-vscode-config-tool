import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ServerManager } from './service/serverManager';
import { logger } from './shared/logger';

export function activate(context: vscode.ExtensionContext) {
	logger.info('Spring Config Cipher extension starting up - preparing encryption magic...');
	const serverManager = ServerManager.getInstance();
	
	registerCommands(context);
	context.subscriptions.push(serverManager);
	
	logger.info('Spring Config Cipher extension ready to encrypt/decrypt your secrets!');
}

export function deactivate() {
	logger.info('Spring Config Cipher extension deactivated - your secrets are safe with us!');
}