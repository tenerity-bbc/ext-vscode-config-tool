import * as vscode from 'vscode';
import { handleCipherCommand } from './cipher';
import { handleSelectServer, handlePinServer, handleUnpinServer } from './server';

export interface CommandDefinition {
	id: string;
	handler: (...args: any[]) => any;
}

export const commands: CommandDefinition[] = [
	{ id: 'config-tool.encrypt', handler: () => handleCipherCommand('encrypt') },
	{ id: 'config-tool.decrypt', handler: () => handleCipherCommand('decrypt') },
	{ id: 'config-tool.selectServer', handler: handleSelectServer },
	{ id: 'config-tool.pinServer', handler: handlePinServer },
	{ id: 'config-tool.unpinServer', handler: handleUnpinServer }
];

export function registerCommands(context: vscode.ExtensionContext): void {
	commands.forEach(({ id, handler }) => {
		const disposable = vscode.commands.registerCommand(id, handler);
		context.subscriptions.push(disposable);
	});
}