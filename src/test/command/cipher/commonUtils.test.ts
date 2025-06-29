import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { applyEdits, updateSelections, logError } from '../../../command/cipher/commonUtils';

suite('CommonUtils Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('applyEdits applies workspace edit and shows success message', async () => {
		const mockDocument = { uri: 'test-uri' };
		const mockEdit = new vscode.TextEdit(new vscode.Range(0, 0, 0, 5), 'new text');
		const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await applyEdits(mockDocument as any, [mockEdit]);

		assert.strictEqual(applyEditStub.calledOnce, true);
		assert.strictEqual(showInfoStub.calledWith('Processed 1 value(s)'), true);
	});

	test('applyEdits shows no values message when no edits', async () => {
		const mockDocument = { uri: 'test-uri' };
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		await applyEdits(mockDocument as any, []);

		assert.strictEqual(showInfoStub.calledWith('No values found'), true);
	});

	test('updateSelections updates editor selections', () => {
		const mockDocument = {
			offsetAt: sandbox.stub().returns(10),
			positionAt: sandbox.stub().returns(new vscode.Position(0, 10))
		};
		const mockEditor = {
			selections: []
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		const mockEdit = new vscode.TextEdit(new vscode.Range(0, 0, 0, 5), 'new text');

		updateSelections(mockDocument as any, [mockEdit]);

		assert.strictEqual(mockEditor.selections.length, 1);
	});

	test('logError logs error with file location', () => {
		const mockDocument = { fileName: 'test.ts' };
		const position = new vscode.Position(5, 10);

		// Test that the function doesn't throw an error
		assert.doesNotThrow(() => {
			logError('Test error', mockDocument as any, position);
		});
	});
});