import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ServerManager } from './service/serverManager';
import { logger } from './shared/logger';

export function activate(context: vscode.ExtensionContext) {
	logger.info('Config Tool extension activating...');
	const serverManager = ServerManager.getInstance();
	
	registerCommands(context);
	context.subscriptions.push(serverManager);
	
	logger.info('Config Tool extension activated successfully');
	vscode.window.showInformationMessage('Config Tool extension activated');
}

export function deactivate() {
	logger.info('Config Tool extension deactivated');
}