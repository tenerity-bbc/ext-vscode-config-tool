import * as vscode from 'vscode';
import { handleCipherCommand } from './cipher';
import { ServerManager } from '../service/serverManager';

export interface CommandDefinition {
	id: string;
	handler: (...args: any[]) => any;
}

const configServerManager = ServerManager.getInstance();

export const commands: CommandDefinition[] = [
	{ id: 'config-tool.encrypt', handler: () => handleCipherCommand('encrypt') },
	{ id: 'config-tool.decrypt', handler: () => handleCipherCommand('decrypt') },
	{ id: 'config-tool.selectServer', handler: () => configServerManager.selectServer() },
	{ id: 'config-tool.pinServer', handler: () => configServerManager.pinCurrentServer() },
	{ id: 'config-tool.unpinServer', handler: () => configServerManager.unpinServer() }
];

export function registerCommands(context: vscode.ExtensionContext): void {
	commands.forEach(({ id, handler }) => {
		const disposable = vscode.commands.registerCommand(id, handler);
		context.subscriptions.push(disposable);
	});
}