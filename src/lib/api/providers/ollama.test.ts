import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { createOllamaProvider } from './ollama';

function makeFetch(responseBody: object) {
	return vi.fn().mockResolvedValue({
		ok: true,
		json: () => Promise.resolve(responseBody)
	});
}

beforeEach(() => {
	vi.unstubAllGlobals();
});

describe('createOllamaProvider', () => {
	it('calls the correct endpoint', async () => {
		const fetch = makeFetch({ message: { content: 'hello' } });
		vi.stubGlobal('fetch', fetch);

		await createOllamaProvider({ provider: 'ollama' }).call('system', 'user input');

		expect(fetch).toHaveBeenCalledOnce();
		const [url] = fetch.mock.calls[0];
		expect(url).toBe('http://localhost:11434/api/chat');
	});

	it('send stream: false and the correct model', async () => {
		const fetch = makeFetch({ message: { content: 'hello' } });
		vi.stubGlobal('fetch', fetch);

		await createOllamaProvider({
			provider: 'ollama',
			model: 'llama3.1'
		}).call('system', 'user input');

		const body = JSON.parse(fetch.mock.calls[0][1].body);
		expect(body.stream).toBe(false);
		expect(body.model).toBe('llama3.1');
	});

	it('does not put system prompt in the messages array', async () => {
		const fetch = makeFetch({ message: { content: 'hello' } });
		vi.stubGlobal('fetch', fetch);

		await createOllamaProvider({ provider: 'ollama' }).call('MY SYSTEM', 'input');

		const { messages } = JSON.parse(fetch.mock.calls[0][1].body);
		expect(messages.every((m: { role: string }) => m.role !== 'system')).toBe(true);
	});

	it('passes system prompt as top-level system field', async () => {
		const fetch = makeFetch({ message: { content: 'hello' } });
		vi.stubGlobal('fetch', fetch);

		await createOllamaProvider({ provider: 'ollama' }).call('MY SYSTEM', 'user input');

		const body = JSON.parse(fetch.mock.calls[0][1].body);
		expect(body.system).toBe('MY SYSTEM');
	});

	it('include language-lock priming messages before the user message', async () => {
		const fetch = makeFetch({ message: { content: 'hello' } });
		vi.stubGlobal('fetch', fetch);

		await createOllamaProvider({ provider: 'ollama' }).call('system', 'my question');

		const { messages } = JSON.parse(fetch.mock.calls[0][1].body);
		expect(messages[0].role).toBe('user');
		expect(messages[1].role).toBe('assistant');
		expect(messages[2]).toEqual({
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
			json: () => Promise.resolve({ message: { content: '你好' } })
		});
		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ message: { content: 'Hello' } })
		});

		const result = await createOllamaProvider({ provider: 'ollama' }).call('system', 'user input');

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(result).toBe('Hello');
	});

	it('includes the correction prompt in the retry messages', async () => {
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);

		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ message: { content: '你好' } })
		});
		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ message: { content: 'Hello' } })
		});

		await createOllamaProvider({ provider: 'ollama' }).call('system', 'input');

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
			createOllamaProvider({ provider: 'ollama' }).call('system', 'user input')
		).rejects.toThrow('Ollama error: 500');
	});

	it('uses a custom host in the endpoint', async () => {
		const fetch = makeFetch({ message: { content: 'hello' } });
		vi.stubGlobal('fetch', fetch);

		await createOllamaProvider({ provider: 'ollama', host: 'my-server' }).call('system', 'input');

		const [url] = fetch.mock.calls[0];
		expect(url).toBe('http://my-server:11434/api/chat');
	});
});
