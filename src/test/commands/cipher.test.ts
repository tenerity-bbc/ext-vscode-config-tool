import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { handleCipherCommand } from '../../commands/cipher';
import * as configClient from '../../service/configService';
import { ServerManager } from '../../service/serverManager';
import { logger } from '../../shared/logger';

function stubCipherUi(sandbox: sinon.SinonSandbox) {
	const mockStatusBar = { show: sandbox.stub(), dispose: sandbox.stub(), text: '' };
	const mockDecoration = { dispose: sandbox.stub() };
	sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBar as unknown as vscode.StatusBarItem);
	sandbox.stub(vscode.window, 'createTextEditorDecorationType').returns(mockDecoration as unknown as vscode.TextEditorDecorationType);
}

function createMockEditor(sandbox: sinon.SinonSandbox, options: {
	getText: string | sinon.SinonStub;
	selections: vscode.Selection[];
}) {
	const getText = typeof options.getText === 'string'
		? sandbox.stub().returns(options.getText)
		: options.getText;

	return {
		document: {
			getText,
			uri: vscode.Uri.file('test.yml'),
			offsetAt: sandbox.stub().returns(0),
			positionAt: sandbox.stub().returns(new vscode.Position(0, 0)),
			fileName: 'test.yml'
		},
		selection: options.selections[0],
		selections: options.selections,
		visibleRanges: [new vscode.Range(0, 0, 0, 0)],
		revealRange: sandbox.stub(),
		setDecorations: sandbox.stub()
	};
}

suite('Cipher Command Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
		stubCipherUi(sandbox);
	});

	teardown(() => {
		sandbox.restore();
	});

	test('returns early when no active editor', async () => {
		sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');

		await handleCipherCommand('encrypt');

		assert.ok(true);
	});

	test('returns early when no server selected', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: '',
			selections: [new vscode.Selection(0, 0, 0, 0)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns(null);

		await handleCipherCommand('encrypt');

		assert.ok(true);
	});

	test('shows nothing-to-process when no text selected for encryption', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: '',
			selections: [new vscode.Selection(0, 0, 0, 0)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await handleCipherCommand('encrypt');

		assert.strictEqual(showInfoStub.calledWith('Nothing to process 🤷'), true);
	});

	test('encrypts selected text and applies edits', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: sandbox.stub().returns('plaintext'),
			selections: [new vscode.Selection(0, 0, 0, 9)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'encrypt').resolves('encrypted123');
		const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await handleCipherCommand('encrypt');

		assert.strictEqual(applyEditStub.calledOnce, true);
		assert.strictEqual(showInfoStub.calledWith('Done! 1/1 ✨'), true);
	});

	test('handles encryption error', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: sandbox.stub().returns('plaintext'),
			selections: [new vscode.Selection(0, 0, 0, 9)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'encrypt').rejects(new Error('Encryption failed'));
		const errorStub = sandbox.stub(logger, 'error');
		const showStub = sandbox.stub(logger, 'show');
		const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

		await handleCipherCommand('encrypt');

		assert.strictEqual(errorStub.calledOnce, true);
		assert.strictEqual(showStub.calledOnce, true);
		assert.strictEqual(showWarningStub.calledWith('0/1 (1 failed) 😅'), true);
	});

	test('decrypts cipher text and applies edits', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: "'{cipher}encrypted123'",
			selections: [new vscode.Selection(0, 0, 0, 0)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'decrypt').resolves('decrypted');
		const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await handleCipherCommand('decrypt');

		assert.strictEqual(applyEditStub.calledOnce, true);
		assert.strictEqual(showInfoStub.calledWith('Done! 1/1 ✨'), true);
	});

	test('decrypts cipher text with various quote patterns', async () => {
		const testCases = [
			'{cipher}encrypted',
			"'{cipher}encrypted'",
			'"{cipher}encrypted"'
		];

		for (const input of testCases) {
			sandbox.restore();
			sandbox = sinon.createSandbox();
			stubCipherUi(sandbox);

			const mockEditor = createMockEditor(sandbox, {
				getText: input,
				selections: [new vscode.Selection(0, 0, 0, 0)]
			});
			sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
			sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
			sandbox.stub(configClient, 'decrypt').resolves('decrypted');
			const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
			const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

			await handleCipherCommand('decrypt');

			assert.strictEqual(applyEditStub.calledOnce, true, `Failed for case: ${input}`);
			assert.strictEqual(showInfoStub.calledWith('Done! 1/1 ✨'), true);
		}
	});

	test('processes multiple cipher patterns', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: "'{cipher}enc1' and '{cipher}enc2'",
			selections: [new vscode.Selection(0, 0, 0, 0)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'decrypt').resolves('decrypted');
		const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await handleCipherCommand('decrypt');

		assert.strictEqual(applyEditStub.callCount, 2);
		assert.strictEqual(showInfoStub.calledWith('Done! 2/2 ✨'), true);
	});

	test('handles decryption error', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: "'{cipher}encrypted123'",
			selections: [new vscode.Selection(0, 0, 0, 0)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'decrypt').rejects(new Error('Decryption failed'));
		const errorStub = sandbox.stub(logger, 'error');
		const showStub = sandbox.stub(logger, 'show');
		const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

		await handleCipherCommand('decrypt');

		assert.strictEqual(errorStub.calledOnce, true);
		assert.strictEqual(showStub.calledOnce, true);
		assert.strictEqual(showWarningStub.calledWith('0/1 (1 failed) 😅'), true);
	});

	test('processes selected text for decryption when selection is not empty', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: sandbox.stub().returns("'{cipher}encrypted123'"),
			selections: [new vscode.Selection(0, 5, 0, 25)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'decrypt').resolves('decrypted');
		const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await handleCipherCommand('decrypt');

		assert.strictEqual(applyEditStub.calledOnce, true);
		assert.strictEqual(showInfoStub.calledWith('Done! 1/1 ✨'), true);
	});

	test('updates selections after applying edits', async () => {
		const mockEditor = createMockEditor(sandbox, {
			getText: sandbox.stub().returns('plaintext'),
			selections: [new vscode.Selection(0, 0, 0, 9)]
		});
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
		sandbox.stub(configClient, 'encrypt').resolves('encrypted123');
		sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
		sandbox.stub(vscode.window, 'showInformationMessage');

		await handleCipherCommand('encrypt');

		assert.strictEqual(mockEditor.selections.length, 1);
	});
});
