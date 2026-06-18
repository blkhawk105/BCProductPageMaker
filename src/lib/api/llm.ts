import { createOllamaProvider } from './providers/ollama';
import { createLmStudioProvider } from './providers/lm-studio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ProviderConfig = {
	provider: 'ollama' | 'lm-studio';
	model?: string;
	host?: string; // default: 'localhost' - Setup in the provider function
};

export type LlmProvider = {
	call(systemPrompt: string, userMessage: string): Promise<string>;
};

const SKILL_DIR = join(process.cwd(), 'skills');
const MODULE_GUIDELINES = readFileSync(join(SKILL_DIR, 'module-guidelines.md'), 'utf-8');

export function loadSkill(skillFile: string): string {
	return readFileSync(join(SKILL_DIR, skillFile), 'utf-8');
}

export async function callLlm(
	skillFile: string,
	userMessage: string,
	provider: LlmProvider
): Promise<string> {
	const system = `${loadSkill(skillFile)}\n\n---\n\n${MODULE_GUIDELINES}`;

	return provider.call(system, userMessage);
}

export function createProvider(config: ProviderConfig): LlmProvider {
	switch (config.provider) {
		case 'ollama':
			return createOllamaProvider(config);

		case 'lm-studio':
			return createLmStudioProvider(config);

		default: {
			const providerName = config.provider as string;
			throw new Error(
				`Could not find provider: ${providerName}. Please double check your configurations and try again.`
			);
		}
	}
}
