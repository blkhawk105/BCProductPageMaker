import type { LlmProvider, ProviderConfig } from '../llm';

// Uses LM Studio's OpenAI-compatible endpoint. Same language-lock + CJK guard as Ollama. Note: LM Studio uses the `system` role in the messages array rather than a top-level `system` field.
export function createLmStudioProvider(config: ProviderConfig): LlmProvider {
	const host = config.host ?? 'localhost';
	const model = config.model ?? 'local-model';
	const endpoint = `http://${host}:1234/v1/chat/completions`;

	return {
		async call(systemPrompt, userMessage) {
			const messages = [
				{
					role: 'system',
					content: systemPrompt
				},
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

			const text = await lmStudioFetch(endpoint, model, messages);

			// CJK detection - retry once with explicit override if non-Latin characters appear
			if (/[　-鿿가-힯]/.test(text)) {
				return lmStudioFetch(endpoint, model, [
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

async function lmStudioFetch(
	endpoint: string,
	model: string,
	messages: Array<{ role: string; content: string }>
): Promise<string> {
	const res = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model, messages, stream: false })
	});

	if (!res.ok) {
		throw new Error(`LM Studio error: ${res.status} ${await res.text()}`);
	}

	const data = (await res.json()) as { choices: [{ message: { content: string } }] };

	return data.choices[0].message.content;
}
