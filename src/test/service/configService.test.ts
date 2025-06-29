import * as assert from 'assert';
import * as sinon from 'sinon';
import * as configService from '../../service/configService';

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

	test('handles HTTP error with JSON response', async () => {
		const httpsStub = sandbox.stub(require('https'), 'request');
		const mockRes = {
			statusCode: 400,
			on: sandbox.stub()
		};
		const mockReq = {
			on: sandbox.stub(),
			write: sandbox.stub(),
			end: sandbox.stub()
		};
		httpsStub.callsArgWith(2, mockRes).returns(mockReq);
		mockRes.on.withArgs('data').callsArgWith(1, '{"description":"Text not encrypted with this key","status":"INVALID"}');
		mockRes.on.withArgs('end').callsArg(1);

		try {
			await configService.encrypt('test');
			assert.fail('Should have thrown');
		} catch (error) {
			assert.strictEqual(error, 'Text not encrypted with this key');
		}
	});

	test('handles HTTP error with non-JSON response', async () => {
		const httpsStub = sandbox.stub(require('https'), 'request');
		const mockRes = {
			statusCode: 500,
			on: sandbox.stub()
		};
		const mockReq = {
			on: sandbox.stub(),
			write: sandbox.stub(),
			end: sandbox.stub()
		};
		httpsStub.callsArgWith(2, mockRes).returns(mockReq);
		mockRes.on.withArgs('data').callsArgWith(1, 'Server Error');
		mockRes.on.withArgs('end').callsArg(1);

		try {
			await configService.decrypt('test');
			assert.fail('Should have thrown');
		} catch (error) {
			assert.strictEqual(error, 'HTTP 500: Server Error');
		}
	});

	test('handles network error', async () => {
		const httpsStub = sandbox.stub(require('https'), 'request');
		const mockReq = {
			on: sandbox.stub(),
			write: sandbox.stub(),
			end: sandbox.stub()
		};
		httpsStub.returns(mockReq);
		mockReq.on.withArgs('error').callsArgWith(1, new Error('Network error'));

		try {
			await configService.encrypt('test');
			assert.fail('Should have thrown');
		} catch (error) {
			assert.strictEqual((error as Error).message, 'Network error');
		}
	});

	test('resolves with response data on success', async () => {
		const httpsStub = sandbox.stub(require('https'), 'request');
		const mockRes = {
			statusCode: 200,
			on: sandbox.stub()
		};
		const mockReq = {
			on: sandbox.stub(),
			write: sandbox.stub(),
			end: sandbox.stub()
		};
		httpsStub.callsArgWith(2, mockRes).returns(mockReq);
		mockRes.on.withArgs('data').callsArgWith(1, 'encrypted_data');
		mockRes.on.withArgs('end').callsArg(1);

		const result = await configService.encrypt('test');
		assert.strictEqual(result, 'encrypted_data');
	});
});