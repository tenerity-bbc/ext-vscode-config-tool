import { identifyAncestor, findGitRoot } from '../utils/git';
import { logger } from '../shared/logger';
import { getServers, getServerSelectors } from '../utils/config';

export interface ServerRule {
	pattern: string;
	serverKey: string;
}

class RuleProcessor {
	async process(rule: ServerRule, filePath: string): Promise<string> {
		const match = filePath.match(new RegExp(rule.pattern, 'i'));
		if (!match) { throw new Error(`File path doesn't match pattern '${rule.pattern}' - this rule isn't for this file 🕵️`); }

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
			const gitRoot = await findGitRoot(filePath);
			const ancestor = await identifyAncestor(gitRoot, Object.keys(mappings));
			return mappings[ancestor] || '';
		}

		throw new Error(`Unknown placeholder '${placeholder}' - I don't know how to handle this one yet 🤷`);
	}
}

export class AutoServerSelector {
	private processor = new RuleProcessor();

	public async autoSelectServer(filePath: string): Promise<string> {
		const servers = getServers();
		const rules = getServerSelectors() as ServerRule[];

		if (rules.length === 0) {
			throw new Error('No server selection rules configured - add some serverSelectors in settings 📝');
		}

		for (const rule of rules) {
			try {
				const serverKey = await this.processor.process(rule, filePath);
				if (servers[serverKey]) {
					return serverKey;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error';
				logger.debug(`Server selection debug: Rule '${rule.pattern}' didn't match - ${message}`);
			}
		}

		throw new Error('None of your server rules matched this file - maybe add a new rule? 🤔');
	}
}