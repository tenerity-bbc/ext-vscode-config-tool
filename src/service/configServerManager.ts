import * as vscode from 'vscode';

export class ConfigServerManager {
	private static instance: ConfigServerManager;
	private statusBarItem: vscode.StatusBarItem;
	private currentServer: string | null = null;
	private isPinned: boolean = false;

	private constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		this.statusBarItem.command = 'config-tool.selectServer';
		this.updateStatusBar();
		this.statusBarItem.show();
	}

	public static getInstance(): ConfigServerManager {
		if (!ConfigServerManager.instance) {
			ConfigServerManager.instance = new ConfigServerManager();
		}
		return ConfigServerManager.instance;
	}

	public getCurrentServer(): string {
		if (this.currentServer) {
			return this.currentServer;
		}
		return this.determineRelevantServer();
	}

	public setServer(serverKey: string, pin: boolean = false): void {
		this.currentServer = serverKey;
		this.isPinned = pin;
		this.updateStatusBar();
	}

	public pinCurrentServer(): void {
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
			picked: key === this.getCurrentServer()
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select config server'
		});

		if(selected){
			this.setServer(selected.description);
		}
	}

	private determineRelevantServer(): string {
		if (this.isPinned && this.currentServer) {
			return this.currentServer;
		}

		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string>;
		
		// TODO: Implement logic based on filepath and branch
		// For now, return ng-us-stage as default
		return 'ng-us-stage';
	}

	private updateStatusBar(): void {
		const serverKey = this.getCurrentServer();
		const pinIcon = this.isPinned ? '$(lock-small)' : '$(file)$(git-branch)';
		this.statusBarItem.text = `${pinIcon} ${serverKey}`;
		this.statusBarItem.tooltip = this.isPinned ? 
			`Config server pinned to: ${serverKey}` : 
			`Current config server: ${serverKey} (auto-determined)`;
	}

	public dispose(): void {
		this.statusBarItem.dispose();
	}
}