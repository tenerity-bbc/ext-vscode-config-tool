import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ServerManager } from './service/serverManager';

export function activate(context: vscode.ExtensionContext) {
	const serverManager = ServerManager.getInstance();
	
	registerCommands(context);
	context.subscriptions.push(serverManager);
}

export function deactivate() {}