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

		assert.strictEqual(registerCommandStub.callCount, 5);
		assert.strictEqual(registerCommandStub.getCall(0).args[0], 'config-tool.encrypt');
		assert.strictEqual(registerCommandStub.getCall(1).args[0], 'config-tool.decrypt');
		assert.strictEqual(registerCommandStub.getCall(2).args[0], 'config-tool.selectServer');
		assert.strictEqual(registerCommandStub.getCall(3).args[0], 'config-tool.pinServer');
		assert.strictEqual(registerCommandStub.getCall(4).args[0], 'config-tool.unpinServer');
		assert.strictEqual(mockContext.subscriptions.length, 6);
	});
});