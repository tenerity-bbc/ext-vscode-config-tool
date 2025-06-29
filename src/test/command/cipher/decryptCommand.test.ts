import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { handleDecryptCommand } from '../../../command/cipher/decryptCommand';
import * as configService from '../../../service/configService';
import * as commonUtils from '../../../command/cipher/commonUtils';

suite('DecryptCommand Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('returns early when no active editor', async () => {
		sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

		await handleDecryptCommand();

		// Should not throw or call any other methods
		assert.ok(true);
	});

	test('decrypts cipher text and applies edits', async () => {
		const mockSelection = new vscode.Selection(0, 0, 0, 0);
		Object.defineProperty(mockSelection, 'isEmpty', { value: true });
		const mockDocument = {
			getText: sandbox.stub().returns("'{cipher}encrypted123'"),
			offsetAt: sandbox.stub().returns(0),
			positionAt: sandbox.stub().returns(new vscode.Position(0, 0))
		};
		const mockEditor = {
			document: mockDocument,
			selection: mockSelection,
			selections: [mockSelection]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(configService, 'decrypt').resolves('decrypted');
		const applyEditsStub = sandbox.stub(commonUtils, 'applyEdits');

		await handleDecryptCommand();

		assert.strictEqual(applyEditsStub.calledOnce, true);
		const edits = applyEditsStub.firstCall.args[1];
		assert.strictEqual(edits.length, 1);
		assert.strictEqual(edits[0].newText, 'decrypted');
	});

	test('handles decryption error', async () => {
		const mockSelection = new vscode.Selection(0, 0, 0, 0);
		Object.defineProperty(mockSelection, 'isEmpty', { value: true });
		const mockDocument = {
			getText: sandbox.stub().returns("'{cipher}encrypted123'"),
			offsetAt: sandbox.stub().returns(0),
			positionAt: sandbox.stub().returns(new vscode.Position(0, 0))
		};
		const mockEditor = {
			document: mockDocument,
			selection: mockSelection,
			selections: [mockSelection]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(configService, 'decrypt').rejects(new Error('Decryption failed'));
		const logErrorStub = sandbox.stub(commonUtils, 'logError');
		sandbox.stub(commonUtils, 'applyEdits');

		await handleDecryptCommand();

		assert.strictEqual(logErrorStub.calledOnce, true);
	});

	test('processes multiple cipher patterns', async () => {
		const mockSelection = new vscode.Selection(0, 0, 0, 0);
		Object.defineProperty(mockSelection, 'isEmpty', { value: true });
		const mockDocument = {
			getText: sandbox.stub().returns("'{cipher}enc1' and '{cipher}enc2'"),
			offsetAt: sandbox.stub().returns(0),
			positionAt: sandbox.stub().returns(new vscode.Position(0, 0))
		};
		const mockEditor = {
			document: mockDocument,
			selection: mockSelection,
			selections: [mockSelection]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		sandbox.stub(configService, 'decrypt').resolves('decrypted');
		const applyEditsStub = sandbox.stub(commonUtils, 'applyEdits');

		await handleDecryptCommand();

		assert.strictEqual(applyEditsStub.calledOnce, true);
		const edits = applyEditsStub.firstCall.args[1];
		assert.strictEqual(edits.length, 2);
	});
});