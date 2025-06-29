import * as https from 'https';
import * as vscode from 'vscode';
import { ConfigServerManager } from './configServerManager';

function getConfigServerUrl(): string {
	const config = vscode.workspace.getConfiguration('configTool');
	const servers = config.get('servers') as Record<string, string>;
	const serverKey = ConfigServerManager.getInstance().getCurrentServer();
	return servers[serverKey] || Object.values(servers)[0];
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

		const req = https.request(`${getConfigServerUrl()}${endpoint}`, options, (res) => {
			let responseData = '';
			res.on('data', chunk => responseData += chunk);
			res.on('end', () => {
				if (res.statusCode === 200) {
					resolve(responseData);
				} else {
					try {
						const error = JSON.parse(responseData);
						reject(error.description || 'Unknown error');
					} catch {
						reject(`HTTP ${res.statusCode}: ${responseData}`);
					}
				}
			});
		});

		req.on('error', reject);
		req.write(data);
		req.end();
	});
}