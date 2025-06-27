import * as https from 'https';

const CONFIG_SERVER_URL = 'https://ng-config-server-us.int.stage-affinionservices.com/config-server';

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

		const req = https.request(`${CONFIG_SERVER_URL}${endpoint}`, options, (res) => {
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