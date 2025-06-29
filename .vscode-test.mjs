import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	useInstallation: {
		fromPath: 'C:\\Program Files\\Microsoft VS Code\\Code.exe'
	}
});
