import * as vscode from 'vscode';
import { AutoServerSelector } from './autoServerSelector';
import { logger } from '../shared/logger';

export class ServerManager {
	private static instance: ServerManager;
	private statusBarItem: vscode.StatusBarItem;
	private currentServer: string | null = null;
	private isPinned: boolean = false;
	private autoSelectionError: string | null = null;
	private autoServerSelector: AutoServerSelector;

	private constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.statusBarItem.command = 'config-tool.selectServer';
		this.autoServerSelector = new AutoServerSelector();
		this.updateStatusBar();
		this.statusBarItem.show();
		vscode.window.onDidChangeActiveTextEditor(() => this.updateStatusBar());
	}

	public static getInstance(): ServerManager {
		if (!ServerManager.instance) {
			ServerManager.instance = new ServerManager();
		}
		return ServerManager.instance;
	}
	public getCurrentServer(): string | null {
		if (!this.currentServer) {
			vscode.window.showErrorMessage('No server selected 🎯');
			return 'Unknown';
		}
		return this.currentServer;
	}
	public setServer(serverKey: string, pin: boolean = true): void {
		logger.info(`📌 Server ${pin ? 'pinned' : 'selected'}: ${serverKey} - ${pin ? 'locked and loaded!' : 'ready to roll!'}`);
		this.currentServer = serverKey;
		this.isPinned = pin;
		this.updateStatusBar();
	}

	public pinCurrentServer(): void {
		this.getCurrentServer();
		logger.info(`Server pinned: ${this.currentServer}`);
		this.isPinned = true;
		this.updateStatusBar();
	}

	public unpinServer(): void {
		logger.info('Server unpinned - auto-selection enabled');
		this.isPinned = false;
		this.updateStatusBar();
	}

	public async selectServer(): Promise<void> {
		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string> || {};

		if (Object.keys(servers).length === 0) {
			vscode.window.showErrorMessage('Add servers in settings first 📝');
			return;
		}

		const items = Object.keys(servers).map(key => {
			let detail = '';
			if (key === this.currentServer && this.isPinned) {
				detail = '$(lock-small) Pinned - Click to unpin';
			} else if (key === this.currentServer && !this.isPinned) {
				detail = '$(sparkle) Auto-selected';
			}
			return {
				label: key,
				description: servers[key],
				detail,
				picked: key === this.currentServer
			};
		});

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select config server'
		});

		if (selected) {
			if (selected.label === this.currentServer && this.isPinned) {
				this.unpinServer();
			} else {
				this.setServer(selected.label);
			}
		}
	}

	private async updateStatusBar(): Promise<void> {
		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string> || {};
		const serverKeys = Object.keys(servers);
		const autoSelectServer = config.get('autoSelectServer', true);

		if (!this.isPinned) {
			this.autoSelectionError = null;
			if (serverKeys.length === 1) {
				// Single server - use it directly
				this.currentServer = serverKeys[0];
			} else if (autoSelectServer) {
				// Multiple servers with auto-selection enabled
				try {
					this.currentServer = await this.determineRelevantServer();
				} catch (error) {
					this.currentServer = null;
					this.autoSelectionError = error instanceof Error ? error.message : 'Unknown error';
				}
			} else {
				// Multiple servers with auto-selection disabled
				this.currentServer = null;
				this.autoSelectionError = 'Auto-selection disabled';
			}
		}

		// Set context variable for menu enablement
		vscode.commands.executeCommand('setContext', 'config-tool.serverSelected', !!this.currentServer);

		let serverKey: string;
		let pinIcon: string;
		let tooltip: string;

		if (this.isPinned) {
			serverKey = this.currentServer || 'Impossible';
			pinIcon = '$(lock-small)';
			tooltip = `Current config server: ${serverKey} (pinned)`;
		} else if (serverKeys.length === 1) {
			serverKey = this.currentServer || 'Impossible';
			pinIcon = '$(check)';
			tooltip = `Current config server: ${serverKey} (only server configured)`;
		} else if (this.currentServer) {
			serverKey = this.currentServer;
			pinIcon = '$(sparkle)';
			tooltip = `Current config server: ${serverKey} (auto-selected)`;
		} else {
			serverKey = 'Not selected';
			pinIcon = '$(warning)';
			tooltip = `No config server selected${this.autoSelectionError ? ` - ${this.autoSelectionError}` : ''}`;
		}

		this.statusBarItem.text = `${pinIcon} ${serverKey}`;
		this.statusBarItem.tooltip = tooltip;
	}

	public dispose(): void {
		this.statusBarItem.dispose();
	}

	private async determineRelevantServer(): Promise<string> {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) { throw new Error('Open a file first 📄'); }

		return this.autoServerSelector.autoSelectServer(activeEditor.document.fileName);
	}
}