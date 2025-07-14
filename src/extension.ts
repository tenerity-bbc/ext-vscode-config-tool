import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ServerManager } from './service/serverManager';
import { logger } from './shared/logger';

export function activate(context: vscode.ExtensionContext) {
	logger.info('Config Tool extension starting up - preparing encryption magic...');
	const serverManager = ServerManager.getInstance();
	
	registerCommands(context);
	context.subscriptions.push(serverManager);
	
	logger.info('Config Tool extension ready to encrypt/decrypt your secrets!');
	vscode.window.showInformationMessage('Config Tool ready! 🔐');
}

export function deactivate() {
	logger.info('Config Tool extension deactivated - your secrets are safe with us!');
}