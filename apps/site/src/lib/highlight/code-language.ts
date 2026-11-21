export type CodeLanguage = 'svelte' | 'vue' | 'javascript' | 'typescript' | 'json' | 'css' | 'rust';

export function outputLanguage(filename: string, inputLanguage: CodeLanguage): CodeLanguage {
	if (filename === 'js' || filename.endsWith('.js')) return 'javascript';
	if (filename === 'css' || filename.endsWith('.css')) return 'css';
	if (filename.endsWith('.json')) return 'json';
	return inputLanguage;
}
