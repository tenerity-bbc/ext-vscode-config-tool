import * as vscode from 'vscode';
import { AutoServerSelector } from './autoServerSelector';
import { logger } from '../shared/logger';
import { getServers, getServerSelectors, getAutoSelectServer } from '../utils/config';

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
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('configTool')) {
				this.updateStatusBar();
			}
		});
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
		logger.info(`Server ${pin ? 'pinned' : 'selected'}: ${serverKey} - ${pin ? 'locked and loaded!' : 'ready to roll!'}`);
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
		const servers = getServers();
		const serverSelectors = getServerSelectors();
		const autoSelectServer = getAutoSelectServer();
		const serverKeys = Object.keys(servers);
		const items: vscode.QuickPickItem[] = [];

		// Add server options if any exist
		if (serverKeys.length > 0) {
			serverKeys.forEach(key => {
				let detail = '';
				if (key === this.currentServer && this.isPinned) {
					detail = '$(lock-small) Pinned - Click to unpin';
				} else if (key === this.currentServer && !this.isPinned) {
					detail = '$(sparkle) Auto-selected';
				}
				items.push({
					label: key,
					description: servers[key],
					detail,
					picked: key === this.currentServer
				});
			});
		}

		// Add configuration options
		if (serverKeys.length === 0) {
			items.push({
				label: '$(gear) Add Servers',
				description: 'Configure config server URLs',
				detail: 'Required: Add at least one server to get started'
			});
		} else if (serverKeys.length > 1 && autoSelectServer && serverSelectors.length === 0) {
			items.push({
				label: '$(list-selection) Add Server Selectors',
				description: 'Configure auto-selection rules',
				detail: 'Recommended: Auto-select servers based on file paths'
			});
		}

		// Always show settings option
		if (items.length > 0) {
			items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
		}
		items.push({
			label: '$(settings-gear) Open Settings',
			description: 'Configure all Config Tool settings'
		});

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: serverKeys.length === 0 ? 'Setup Config Tool' : 'Select config server or configure settings'
		});

		if (selected) {
			if (selected.label.includes('Add Servers')) {
				vscode.commands.executeCommand('workbench.action.openSettings', 'configTool.servers');
			} else if (selected.label.includes('Add Server Selectors')) {
				vscode.commands.executeCommand('workbench.action.openSettings', 'configTool.serverSelectors');
			} else if (selected.label.includes('Open Settings')) {
				vscode.commands.executeCommand('workbench.action.openSettings', 'configTool');
			} else {
				// Regular server selection
				if (selected.label === this.currentServer && this.isPinned) {
					this.unpinServer();
				} else {
					this.setServer(selected.label);
				}
			}
		}
	}

	private async updateStatusBar(): Promise<void> {
		const servers = getServers();
		const serverKeys = Object.keys(servers);
		const serverSelectors = getServerSelectors();
		const autoSelectServer = getAutoSelectServer();
		// Handle configuration states
		if (serverKeys.length === 0) {
			// No servers configured
			this.currentServer = null;
			this.autoSelectionError = 'No servers configured';
		} else if (!this.isPinned) {
			this.autoSelectionError = null;
			if (serverKeys.length === 1) {
				// Single server - use it directly
				this.currentServer = serverKeys[0];
			} else if (autoSelectServer && serverSelectors.length === 0) {
				// Multiple servers but no selectors
				this.currentServer = null;
				this.autoSelectionError = 'Server selectors needed';
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
		let icon: string;
		let tooltip: string;

		if (this.isPinned && this.currentServer) {
			serverKey = this.currentServer;
			icon = '$(lock-small)';
			tooltip = `Current config server: ${serverKey} (pinned)`;
		} else if (serverKeys.length === 1) {
			serverKey = this.currentServer || 'Error';
			icon = '$(check)';
			tooltip = `Current config server: ${serverKey} (only server configured)`;
		} else if (this.currentServer) {
			serverKey = this.currentServer;
			icon = '$(sparkle)';
			tooltip = `Current config server: ${serverKey} (auto-selected)`;
		} else if (serverKeys.length === 0) {
			serverKey = 'No Servers';
			icon = '$(error)';
			tooltip = `No config server selected - ${this.autoSelectionError}`;
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
		} else if (serverSelectors.length === 0) {
			serverKey = 'Not Selectors';
			icon = '$(warning)';
			tooltip = `No config server selected - ${this.autoSelectionError}`;
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
		} else {
			serverKey = 'Not Selected';
			icon = '$(warning)';
			tooltip = `${this.autoSelectionError}`;
		}

		// Clear background color for normal states
		if (this.currentServer) {
			this.statusBarItem.backgroundColor = undefined;
		}

		this.statusBarItem.text = `${icon} ${serverKey}`;
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