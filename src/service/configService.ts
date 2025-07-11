import * as https from 'https';
import * as vscode from 'vscode';
import { ServerManager } from './serverManager';
import { logger } from '../shared/logger';

export class ConfigServiceError extends Error {
	constructor(message: string, public isFatal: boolean = false) {
		super(message);
		this.name = 'ConfigServiceError';
	}
}

function getConfigServerUrl(): string {
	const config = vscode.workspace.getConfiguration('configTool');
	const servers = config.get('servers') as Record<string, string>;
	const serverKey = ServerManager.getInstance().getCurrentServer();
	if(!serverKey) {throw new Error('No server selected');}
	return servers[serverKey];
}

export async function decrypt(ciphertext: string): Promise<string> {
	return makeRequest('/decrypt', ciphertext);
}

export async function encrypt(plaintext: string): Promise<string> {
	return makeRequest('/encrypt', plaintext);
}

function makeRequest(endpoint: string, data: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' }
		};

		const url = `${getConfigServerUrl()}${endpoint}`;
		logger.info(`HTTP ${options.method} ${url}`);
		const req = https.request(url, options, (res) => {
			let responseData = '';
			res.on('data', chunk => responseData += chunk);
			res.on('end', () => {
				const statusCode = res.statusCode || 0;
				if (statusCode === 200) {
					logger.info(`HTTP ${statusCode} - Success`);
					resolve(responseData);
				} else {
					logger.error(`HTTP ${statusCode} - Error: ${responseData}`);
					const isFatal = statusCode === 401 || statusCode === 403 || statusCode >= 500;
					try {
						const error = JSON.parse(responseData);
						reject(new ConfigServiceError(error.description || 'Unknown error', isFatal));
					} catch {
						reject(new ConfigServiceError(`HTTP ${statusCode}: ${responseData}`, isFatal));
					}
				}
			});
		});

		req.on('error', (err) => {
			// Network errors are always fatal
			reject(new ConfigServiceError(err.message, true));
		});
		req.on('timeout', () => {
			reject(new ConfigServiceError('Request timeout', true));
		});
		req.write(data);
		req.end();
	});
}