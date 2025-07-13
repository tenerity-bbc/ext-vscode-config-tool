import * as vscode from 'vscode';

/**
 * Gets the effective configuration value, handling empty arrays properly.
 * Priority: workspace > global > default, but skips empty arrays in workspace.
 */
export function getEffectiveConfig<T>(config: vscode.WorkspaceConfiguration, key: string): T {
	const inspection = config.inspect(key);
	if (!inspection) {
		return config.get(key) as T;
	}

	// For arrays, skip empty workspace values to allow global fallback
	if (Array.isArray(inspection.workspaceValue)) {
		if (inspection.workspaceValue.length > 0) {
			return inspection.workspaceValue as T;
		}
		// Workspace array is empty, try global
		if (Array.isArray(inspection.globalValue) && inspection.globalValue.length > 0) {
			return inspection.globalValue as T;
		}
		return (inspection.defaultValue || []) as T;
	}

	// For non-arrays, use standard priority
	return config.get(key) as T;
}

// Specific getters for each configuration
export function getServers(): Record<string, string> {
	const config = vscode.workspace.getConfiguration('configTool');
	return getEffectiveConfig<Record<string, string>>(config, 'servers') || {};
}

export function getServerSelectors(): any[] {
	const config = vscode.workspace.getConfiguration('configTool');
	return getEffectiveConfig<any[]>(config, 'serverSelectors') || [];
}

export function getAutoSelectServer(): boolean {
	const config = vscode.workspace.getConfiguration('configTool');
	return getEffectiveConfig<boolean>(config, 'autoSelectServer') ?? true;
}