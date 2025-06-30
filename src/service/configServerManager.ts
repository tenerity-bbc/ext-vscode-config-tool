import * as vscode from 'vscode';
import * as path from 'path';
import { getConfigBranch } from './branchRegionUtil';
import { outputChannel } from '../shared/outputChannel';

export class ConfigServerManager {
	private static instance: ConfigServerManager;
	private statusBarItem: vscode.StatusBarItem;
	private currentServer: string | null = null;
	private isPinned: boolean = false;

	private constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.statusBarItem.command = 'config-tool.selectServer';
		this.updateStatusBar();
		this.statusBarItem.show();
		vscode.window.onDidChangeActiveTextEditor(() => this.updateStatusBar());
	}

	public static getInstance(): ConfigServerManager {
		if (!ConfigServerManager.instance) {
			ConfigServerManager.instance = new ConfigServerManager();
		}
		return ConfigServerManager.instance;
	}
	public getCurrentServer(): string | null {
		if (!this.currentServer) {
			vscode.window.showErrorMessage('Server is not selected');
			return 'Unknown';
		}
		return this.currentServer;
	}
	public setServer(serverKey: string, pin: boolean = true): void {
		this.currentServer = serverKey;
		this.isPinned = pin;
		this.updateStatusBar();
	}

	public pinCurrentServer(): void {
		this.getCurrentServer();
		this.isPinned = true;
		this.updateStatusBar();
	}

	public unpinServer(): void {
		this.isPinned = false;
		this.updateStatusBar();
	}

	public async selectServer(): Promise<void> {
		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string> || {};

		if (Object.keys(servers).length === 0) {
			vscode.window.showErrorMessage('No config servers configured');
			return;
		}

		const items = Object.keys(servers).map(key => ({
			label: key,
			description: servers[key],
			picked: key === this.currentServer
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select config server'
		});

		if (selected) {
			this.setServer(selected.label);
		}
	}

	private async updateStatusBar(): Promise<void> {
		if (!this.isPinned) {
			this.currentServer = await this.determineRelevantServer();
		}
		const serverKey = this.currentServer ? this.currentServer : 'Unknown';
		const pinIcon = this.isPinned ? '$(lock-small)' : this.currentServer ? '$(sparkle)' : '$(warning)';
		this.statusBarItem.text = `${pinIcon} ${serverKey}`;
		this.statusBarItem.tooltip = this.isPinned ?
			`Config server pinned to: ${serverKey}` :
			`Current config server: ${serverKey} (auto-determined)`;
	}

	public dispose(): void {
		this.statusBarItem.dispose();
	}

	private async determineRelevantServer(): Promise<string | null>{
		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string>;
		const activeEditor = vscode.window.activeTextEditor;

		if (!activeEditor) { return null; }

		const filePath = activeEditor.document.fileName;
		const storeMatch = filePath.match(/[/\\](gce-(apg|ng)-config-store)[/\\]/i);
		const storeType = storeMatch?.[2];

		let configServer: string | null = null;

		if (storeType === 'apg') {
			const apgMatch = filePath.match(/[/\\]gce-apg-config-store[/\\]([^/\\]+)[/\\][^/\\]+\.ya?ml$/i);
			if (apgMatch) { configServer = `apg-${apgMatch[1]}`; }
		} else if (storeType === 'ng') {
			const ngMatch = filePath.match(/[/\\]gce-ng-config-store[/\\][^/\\]+[/\\][^/\\]+-(\w+)\.ya?ml$/i);
			if (ngMatch) { 
				try {
					const region = await this.region(filePath);
					configServer = `ng-${region}${ngMatch[1]}`;
				} catch (error) {
					outputChannel.appendLine(`Failed to determine region: ${error}`);
					outputChannel.show();
					configServer = null;
				}
			}
		}

		return (configServer && servers[configServer]) ? configServer : null;
	}

	private async region(filePath: string): Promise<string> {
		const rootPath = path.dirname(path.dirname(filePath));
		const configBranch = await getConfigBranch(rootPath);
		return configBranch === 'develop-US' ? 'us-' : '';
	}
}