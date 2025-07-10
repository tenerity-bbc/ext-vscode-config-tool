import * as vscode from 'vscode';
import * as path from 'path';
import { identifyAncestor } from '../utils/git';

const LOG_PREFIX = '[Config Tool]';

export interface ServerRule {
	pattern: string;
	serverKey: string;
}

class RuleProcessor {
	async process(rule: ServerRule, filePath: string): Promise<string> {
		const match = filePath.match(new RegExp(rule.pattern, 'i'));
		if (!match) { throw new Error(`file path does not match pattern '${rule.pattern}'`); }

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
			const value = await this.resolvePlaceholder(placeholder, filePath);
			serverKey = serverKey.replace(placeholderMatch[0], value);
		}

		return serverKey;
	}

	private async resolvePlaceholder(placeholder: string, filePath: string): Promise<string> {
		const [hintSource, dataPoint] = placeholder.split(':');

		if (hintSource === 'git' && dataPoint?.includes('ancestorRegion[')) {
			const mappings = Object.fromEntries(
				dataPoint.substring(dataPoint.indexOf('[') + 1, dataPoint.indexOf(']'))
					.split(',').map(m => m.split('=').map(s => s.trim()))
			);
			const gitRoot = path.dirname(path.dirname(filePath));
			const ancestor = await identifyAncestor(gitRoot, Object.keys(mappings));
			return mappings[ancestor] || '';
		}

		throw new Error(`Unsupported placeholder: ${placeholder}`);
	}
}

export class AutoServerSelector {
	private processor = new RuleProcessor();

	public async autoSelectServer(filePath: string): Promise<string> {
		const config = vscode.workspace.getConfiguration('configTool');
		const servers = config.get('servers') as Record<string, string> || {};
		const rules = config.get('serverSelectors') as ServerRule[] || [];
		const debugRules = vscode.env.logLevel <= vscode.LogLevel.Debug;

		if (rules.length === 0) {
			throw new Error('No serverSelectors are configured');
		}

		for (const rule of rules) {
			try {
				const serverKey = await this.processor.process(rule, filePath);
				if (servers[serverKey]) {
					return serverKey;
				}
			} catch (error) {
				if (debugRules) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					const logMessage = `Server selection: Rule failed - pattern: '${rule.pattern}', error: ${message}`;
				console.log(`${LOG_PREFIX} ${logMessage}`);
				}
			}
		}

		throw new Error('No server selector rules matched the file path');
	}
}