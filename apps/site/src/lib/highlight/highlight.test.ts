import { describe, expect, it } from 'vitest';
import { highlight } from './highlight';
import { outputLanguage } from './code-language';

describe('highlighting', () => {
	it('preserves untrusted markup and blank lines as text', async () => {
		const source = '<script>const text = "<img src=x onerror=alert(1)>";</script>\n\n';
		const tokens = await highlight(source, 'svelte');
		expect(tokens.map((line) => line.map((token) => token.content).join('')).join('\n')).toBe(
			source,
		);
	});
	it('highlights each output language with theme variables', async () => {
		const cases = Object.entries({
			javascript: 'const count = 42;',
			typescript: 'const count: number = 42;',
			'css': 'button { color: royalblue; }',
			'json': '{"count":42}',
			rust: 'Root { nodes: [], count: 42 }',
		}) as [Parameters<typeof highlight>[1], string][];
		const highlighted = await Promise.all(
			cases.map(([language, source]) => highlight(source, language)),
		);
		for (const tokens of highlighted) {
			expect(tokens.flat().every((token) => token.color?.startsWith('var(--shiki-'))).toBe(true);
			expect(new Set(tokens.flat().map((token) => token.color)).size).toBeGreaterThan(1);
		}
	});
	it('selects the actual file language', () => {
		expect(outputLanguage('js', 'svelte')).toBe('javascript');
		expect(outputLanguage('css', 'vue')).toBe('css');
		expect(outputLanguage('lint.json', 'svelte')).toBe('json');
		expect(outputLanguage('Counter.vue', 'vue')).toBe('vue');
	});
});
