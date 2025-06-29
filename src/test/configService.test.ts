import * as assert from 'assert';
import * as sinon from 'sinon';
import * as configService from '../configService';

suite('ConfigService Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('encrypt makes POST request to /encrypt', async () => {
		const httpsStub = sandbox.stub(require('https'), 'request');
		const mockReq = {
			on: sandbox.stub(),
			write: sandbox.stub(),
			end: sandbox.stub()
		};
		httpsStub.returns(mockReq);

		configService.encrypt('test');

		assert.strictEqual(httpsStub.calledOnce, true);
		const [url, options] = httpsStub.firstCall.args;
		assert.strictEqual(url.includes('/encrypt'), true);
		assert.strictEqual(options.method, 'POST');
	});

	test('decrypt makes POST request to /decrypt', async () => {
		const httpsStub = sandbox.stub(require('https'), 'request');
		const mockReq = {
			on: sandbox.stub(),
			write: sandbox.stub(),
			end: sandbox.stub()
		};
		httpsStub.returns(mockReq);

		configService.decrypt('test');

		assert.strictEqual(httpsStub.calledOnce, true);
		const [url] = httpsStub.firstCall.args;
		assert.strictEqual(url.includes('/decrypt'), true);
	});
});