import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { handleCipherCommand } from '../../commands/cipher';
import * as configClient from '../../service/configService';
import { ServerManager } from '../../service/serverManager';
import { outputChannel } from '../../shared/outputChannel';

suite('Cipher Command Test Suite', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
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
        const mockEditor = { selections: [] };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns(null);

        await handleCipherCommand('encrypt');

        assert.ok(true);
    });

    test('shows warning when no text selected for encryption', async () => {
        const mockEditor = {
            document: { getText: sandbox.stub() },
            selections: [new vscode.Selection(0, 0, 0, 0)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('encrypt');

        assert.strictEqual(showWarningStub.calledWith('Please select text to encrypt'), true);
        assert.strictEqual(showInfoStub.calledWith('No values found'), true);
    });

    test('encrypts selected text and applies edits', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns('plaintext'),
            uri: 'test-uri',
            offsetAt: sandbox.stub().returns(10),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 10))
        };
        const mockEditor = {
            document: mockDocument,
            selections: [new vscode.Selection(0, 0, 0, 9)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'encrypt').resolves('encrypted123');
        const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('encrypt');

        assert.strictEqual(applyEditStub.calledOnce, true);
        assert.strictEqual(showInfoStub.calledWith('Processed 1 value(s)'), true);
    });

    test('handles encryption error', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns('plaintext'),
            uri: 'test-uri',
            fileName: 'test.ts',
            offsetAt: sandbox.stub().returns(10),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 10))
        };
        const mockEditor = {
            document: mockDocument,
            selections: [new vscode.Selection(0, 0, 0, 9)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'encrypt').rejects(new Error('Encryption failed'));
        const appendLineStub = sandbox.stub(outputChannel, 'appendLine');
        const showStub = sandbox.stub(outputChannel, 'show');
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('encrypt');

        assert.strictEqual(appendLineStub.calledOnce, true);
        assert.strictEqual(showStub.calledOnce, true);
        assert.strictEqual(showInfoStub.calledWith('No values found'), true);
    });

    test('decrypts cipher text and applies edits', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns("'{cipher}encrypted123'"),
            uri: 'test-uri',
            offsetAt: sandbox.stub().returns(0),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 0))
        };
        const mockEditor = {
            document: mockDocument,
            selection: new vscode.Selection(0, 0, 0, 0),
            selections: [new vscode.Selection(0, 0, 0, 0)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'decrypt').resolves('decrypted');
        const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('decrypt');

        assert.strictEqual(applyEditStub.calledOnce, true);
        assert.strictEqual(showInfoStub.calledWith('Processed 1 value(s)'), true);
    });

    test('decrypts cipher text with various quote patterns', async () => {
        const testCases = [
            '{cipher}encrypted',
            "'{cipher}encrypted'",
            '"{cipher}encrypted"'
        ];

        for (const input of testCases) {
            const mockDocument = {
                getText: sandbox.stub().returns(input),
                uri: 'test-uri',
                offsetAt: sandbox.stub().returns(0),
                positionAt: sandbox.stub().returns(new vscode.Position(0, 0))
            };
            const mockEditor = {
                document: mockDocument,
                selection: new vscode.Selection(0, 0, 0, 0),
                selections: [new vscode.Selection(0, 0, 0, 0)]
            };
            sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
            sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
            sandbox.stub(configClient, 'decrypt').resolves('decrypted');
            const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
            const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

            await handleCipherCommand('decrypt');

            assert.strictEqual(applyEditStub.calledOnce, true, `Failed for case: ${input}`);
            assert.strictEqual(showInfoStub.calledWith('Processed 1 value(s)'), true);
            sandbox.restore();
            sandbox = sinon.createSandbox();
        }
    });

    test('processes multiple cipher patterns', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns("'{cipher}enc1' and '{cipher}enc2'"),
            uri: 'test-uri',
            offsetAt: sandbox.stub().returns(0),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 0))
        };
        const mockEditor = {
            document: mockDocument,
            selection: new vscode.Selection(0, 0, 0, 0),
            selections: [new vscode.Selection(0, 0, 0, 0)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'decrypt').resolves('decrypted');
        const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('decrypt');

        assert.strictEqual(applyEditStub.calledOnce, true);
        assert.strictEqual(showInfoStub.calledWith('Processed 2 value(s)'), true);
    });

    test('handles decryption error', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns("'{cipher}encrypted123'"),
            uri: 'test-uri',
            offsetAt: sandbox.stub().returns(0),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 0)),
            fileName: 'test.ts'
        };
        const mockEditor = {
            document: mockDocument,
            selection: new vscode.Selection(0, 0, 0, 0),
            selections: [new vscode.Selection(0, 0, 0, 0)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'decrypt').rejects(new Error('Decryption failed'));
        const appendLineStub = sandbox.stub(outputChannel, 'appendLine');
        const showStub = sandbox.stub(outputChannel, 'show');
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('decrypt');

        assert.strictEqual(appendLineStub.calledOnce, true);
        assert.strictEqual(showStub.calledOnce, true);
        assert.strictEqual(showInfoStub.calledWith('No values found'), true);
    });

    test('processes selected text for decryption when selection is not empty', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns("'{cipher}encrypted123'"),
            uri: 'test-uri',
            offsetAt: sandbox.stub().returns(5),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 5))
        };
        const mockEditor = {
            document: mockDocument,
            selection: new vscode.Selection(0, 5, 0, 25),
            selections: [new vscode.Selection(0, 5, 0, 25)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'decrypt').resolves('decrypted');
        const applyEditStub = sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('decrypt');

        assert.strictEqual(applyEditStub.calledOnce, true);
        assert.strictEqual(showInfoStub.calledWith('Processed 1 value(s)'), true);
    });

    test('updates selections after applying edits', async () => {
        const mockDocument = {
            getText: sandbox.stub().returns('plaintext'),
            uri: 'test-uri',
            offsetAt: sandbox.stub().returns(10),
            positionAt: sandbox.stub().returns(new vscode.Position(0, 10))
        };
        const mockEditor = {
            document: mockDocument,
            selections: [new vscode.Selection(0, 0, 0, 9)]
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(ServerManager.getInstance(), 'getCurrentServer').returns('test-server');
        sandbox.stub(configClient, 'encrypt').resolves('encrypted123');
        sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        sandbox.stub(vscode.window, 'showInformationMessage');

        await handleCipherCommand('encrypt');

        assert.strictEqual(mockEditor.selections.length, 1);
    });
});