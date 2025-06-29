import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as extension from '../extension';

suite('Extension Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('activate registers commands', () => {
		const mockContext = {
			subscriptions: []
		} as Partial<vscode.ExtensionContext> as vscode.ExtensionContext;
		const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand');

		extension.activate(mockContext);

		assert.strictEqual(registerCommandStub.callCount, 2);
		assert.strictEqual(registerCommandStub.firstCall.args[0], 'config-tool.encrypt');
		assert.strictEqual(registerCommandStub.secondCall.args[0], 'config-tool.decrypt');
	});

	test('encrypt command with no active editor', async () => {
		sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
		const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

		await vscode.commands.executeCommand('config-tool.encrypt');

		assert.strictEqual(showWarningStub.called, false);
	});

	test('encrypt command with no selection shows warning', async () => {
		const mockEditor = {
			selections: [new vscode.Selection(0, 0, 0, 0)]
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
		const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

		await vscode.commands.executeCommand('config-tool.encrypt');

		assert.strictEqual(showWarningStub.calledWith('Please select text to encrypt'), true);
	});
});