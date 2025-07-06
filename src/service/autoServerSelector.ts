import * as vscode from 'vscode';
import * as path from 'path';
import { getConfigBranch } from '../utils/git';

export interface ServerRule {
	pattern: string;
	serverKey: string;
	substitutions?: Record<string, string>;
}

class RuleProcessor {
	async process(rule: ServerRule, filePath: string): Promise<string | null> {
		const match = filePath.match(new RegExp(rule.pattern, 'i'));
		if (!match) { return null; }

		let serverKey = rule.serverKey;

		// Replace $1, $2, etc. with regex groups
		for (let i = 1; i < match.length; i++) {
			serverKey = serverKey.replace(`$${i}`, match[i]);
		}

		// Handle generic substitutions
		const placeholderRegex = /\{([^}]+)\}/g;
		let placeholderMatch;
		while ((placeholderMatch = placeholderRegex.exec(serverKey)) !== null) {
			const placeholder = placeholderMatch[1];
			const value = await this.resolvePlaceholder(placeholder, rule.substitutions, filePath);
			if (value !== null) {
				serverKey = serverKey.replace(placeholderMatch[0], value);
			}
		}

		return serverKey;
	}

	private async resolvePlaceholder(placeholder: string, substitutions: Record<string, string> | undefined, filePath: string): Promise<string | null> {
		// Two-step resolution: {hint-source:data-point}>target
		if (placeholder.includes('>')) {
			const [hintSpec, _] = placeholder.split('>');

			// Step 1: Resolve hint to get actual value
			const actualValue = await this.resolveHint(hintSpec, filePath);
			if (actualValue === null) { return ''; }

			// Step 2: Apply substitution mapping
			const substitutionKey = `${hintSpec}.${actualValue}`;
			return substitutions?.[substitutionKey] || '';
		}

		// Direct hint resolution: {hint-source:data-point}
		if (placeholder.includes(':')) {
			return await this.resolveHint(placeholder, filePath) || '';
		}

		return substitutions?.[placeholder] || '';
	}

	private async resolveHint(hintSpec: string, filePath: string): Promise<string | null> {
		const [hintSource, dataPoint] = hintSpec.split(':');

		if (hintSource === 'git' && dataPoint === 'configBranch') {
			try {
				const rootPath = path.dirname(path.dirname(filePath));
				return await getConfigBranch(rootPath);
			} catch {
				return null;
			}
		}

		return null;
	}
}

export class AutoServerSelector {
	private processor = new RuleProcessor();

	public async autoSelectServer(filePath: string): Promise<string | null> {
		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string> || {};
		const rules = config.get('serverSelectors') as ServerRule[] || [];

		for (const rule of rules) {
			const serverKey = await this.processor.process(rule, filePath);
			if (serverKey && servers[serverKey]) {
				return serverKey;
			}
		}

		return null;
	}
}