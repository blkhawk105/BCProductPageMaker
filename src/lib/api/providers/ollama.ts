import type { LlmProvider, ProviderConfig } from '../llm';

// Uses Ollama's  native `/api/chat` endpoint. Applies language-lock priming and CJK detection internally — the orchestrator sees none of this.
export function createOllamaProvider(config: ProviderConfig): LlmProvider {
	const host = config.host ?? 'localhost';
	const model = config.model ?? 'qwen3.6';
	const endpoint = `http://${host}:11434/api/chat`;

	return {
		async call(systemPrompt, userMessage) {
			const messages = [
				// Language-lock priming - Prevents some models like Qwen from reverting to Chinese
				{
					role: 'user',
					content: 'Respond ONLY in the English Language.'
				},
				{
					role: 'assistant',
					content: 'Understood, all my responses will be in English.'
				},
				{
					role: 'user',
					content: userMessage
				}
			];

			const text = await ollamaFetch(endpoint, model, systemPrompt, messages);

			// CJK detection - retry once with explicit override if non-Latin characters appear
			if (/[　-鿿가-힯]/.test(text)) {
				return ollamaFetch(endpoint, model, systemPrompt, [
					...messages,
					{
						role: 'assistant',
						content: text
					},
					{
						role: 'user',
						content:
							'Your response contained non-English characters. Rewrite it entirely in English.'
					}
				]);
			}

			return text;
		}
	};
}

async function ollamaFetch(
	endpoint: string,
	model: string,
	system: string,
	messages: Array<{ role: string; content: string }>
): Promise<string> {
	const res = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model, system, messages, stream: false })
	});

	// Make sure there is a valid response
	if (!res.ok) {
		throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
	}

	const data = (await res.json()) as { message: { content: string } };

	return data.message.content;
}
