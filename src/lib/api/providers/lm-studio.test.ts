import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { createLmStudioProvider } from './lm-studio';

function makeFetch(responseBody: object) {
	return vi.fn().mockResolvedValue({
		ok: true,
		json: () => Promise.resolve(responseBody)
	});
}

beforeEach(() => {
	vi.unstubAllGlobals();
});

describe('createLmStudioProvider', () => {
	it('calls the correct endpoint', async () => {
		const fetch = makeFetch({ choices: [{ message: { content: 'hello' } }] });
		vi.stubGlobal('fetch', fetch);

		await createLmStudioProvider({ provider: 'lm-studio' }).call('system', 'user input');

		const [url] = fetch.mock.calls[0];
		expect(url).toBe('http://localhost:1234/v1/chat/completions');
	});

	it('send stream: false and the correct model', async () => {
		const fetch = makeFetch({ choices: [{ message: { content: 'hello' } }] });
		vi.stubGlobal('fetch', fetch);

		await createLmStudioProvider({
			provider: 'lm-studio',
			model: 'llama3.1'
		}).call('system', 'user input');

		const body = JSON.parse(fetch.mock.calls[0][1].body);
		expect(body.stream).toBe(false);
		expect(body.model).toBe('llama3.1');
	});

	it('puts system prompt in messages array, not a top-level field', async () => {
		const fetch = makeFetch({ choices: [{ message: { content: 'hello' } }] });
		vi.stubGlobal('fetch', fetch);

		await createLmStudioProvider({ provider: 'lm-studio' }).call('MY SYSTEM', 'user input');

		const body = JSON.parse(fetch.mock.calls[0][1].body);
		expect(body.system).toBeUndefined();
		expect(body.messages[0]).toEqual({ role: 'system', content: 'MY SYSTEM' });
	});

	it('includes language-lock priming after the system message', async () => {
		const fetch = makeFetch({ choices: [{ message: { content: 'hello' } }] });
		vi.stubGlobal('fetch', fetch);

		await createLmStudioProvider({ provider: 'lm-studio' }).call('system', 'my question');

		const { messages } = JSON.parse(fetch.mock.calls[0][1].body);
		expect(messages[0].role).toBe('system');
		expect(messages[1].role).toBe('user');
		expect(messages[2].role).toBe('assistant');
		expect(messages[3]).toEqual({
			role: 'user',
			content: 'my question'
		});
	});

	it('retries with override when response contains CJK characters', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);

		// Second call returns clean English
		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ choices: [{ message: { content: '你好' } }] })
		});
		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ choices: [{ message: { content: 'Hello' } }] })
		});

		const result = await createLmStudioProvider({ provider: 'lm-studio' }).call(
			'system',
			'user input'
		);

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(result).toBe('Hello');
	});

	it('includes the correction prompt in the retry messages', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);

		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ choices: [{ message: { content: '你好' } }] })
		});
		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ choices: [{ message: { content: 'Hello' } }] })
		});

		await createLmStudioProvider({ provider: 'lm-studio' }).call('system', 'input');

		const retryMessages = JSON.parse(fetch.mock.calls[1][1].body).messages;
		const last = retryMessages.at(-1);
		expect(last.role).toBe('user');
		expect(last.content).toMatch(/non-English/);
	});

	it('throws on non-ok response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error')
			})
		);

		await expect(
			createLmStudioProvider({ provider: 'lm-studio' }).call('system', 'user input')
		).rejects.toThrow('LM Studio error: 500');
	});

	it('uses a custom host in the endpoint', async () => {
		const fetch = makeFetch({ choices: [{ message: { content: 'hello' } }] });
		vi.stubGlobal('fetch', fetch);

		await createLmStudioProvider({ provider: 'lm-studio', host: 'my-server' }).call(
			'system',
			'input'
		);

		const [url] = fetch.mock.calls[0];
		expect(url).toBe('http://my-server:1234/v1/chat/completions');
	});
});
