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
		assert.strictEqual(mockContext.subscriptions.length, 2);
	});
});