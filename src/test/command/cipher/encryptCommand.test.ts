import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { handleEncryptCommand } from '../../../command/cipher/encryptCommand';
import * as configService from '../../../service/configService';
import * as commonUtils from '../../../command/cipher/commonUtils';

suite('EncryptCommand Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('returns early when no active editor', async () => {
		sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
		const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

		await handleEncryptCommand();

		assert.strictEqual(showWarningStub.called, false);
	});

	test('shows warning when no text selected', async () => {
		const mockEditor = {
			selections: [new vscode.Selection(0, 0, 0, 0)]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

		await handleEncryptCommand();

		assert.strictEqual(showWarningStub.calledWith('Please select text to encrypt'), true);
	});

	test('encrypts selected text and applies edits', async () => {
		const mockDocument = {
			getText: sandbox.stub().returns('plaintext')
		};
		const mockEditor = {
			document: mockDocument,
			selections: [new vscode.Selection(0, 0, 0, 9)]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(configService, 'encrypt').resolves('encrypted123');
		const applyEditsStub = sandbox.stub(commonUtils, 'applyEdits');

		await handleEncryptCommand();

		assert.strictEqual(applyEditsStub.calledOnce, true);
		const edits = applyEditsStub.firstCall.args[1];
		assert.strictEqual(edits.length, 1);
		assert.strictEqual(edits[0].newText, "'{cipher}encrypted123'");
	});

	test('handles encryption error', async () => {
		const mockDocument = {
			getText: sandbox.stub().returns('plaintext')
		};
		const mockEditor = {
			document: mockDocument,
			selections: [new vscode.Selection(0, 0, 0, 9)]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(configService, 'encrypt').rejects(new Error('Encryption failed'));
		const logErrorStub = sandbox.stub(commonUtils, 'logError');
		sandbox.stub(commonUtils, 'applyEdits');

		await handleEncryptCommand();

		assert.strictEqual(logErrorStub.calledOnce, true);
	});
});