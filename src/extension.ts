import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ServerManager } from './service/serverManager';
import { outputChannel } from './shared/outputChannel';

export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('Config Tool extension activating...');
	const serverManager = ServerManager.getInstance();
	
	registerCommands(context);
	context.subscriptions.push(serverManager);
	
	outputChannel.appendLine('Config Tool extension activated successfully');
	vscode.window.showInformationMessage('Config Tool extension activated');
}

export function deactivate() {
	outputChannel.appendLine('Config Tool extension deactivated');
}