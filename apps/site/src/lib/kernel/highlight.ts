import { createCssVariablesTheme, createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import svelte from 'shiki/langs/svelte.mjs';
import vue from 'shiki/langs/vue.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import structuredData from 'shiki/langs/json.mjs';
import stylesheet from 'shiki/langs/css.mjs';
import rust from 'shiki/langs/rust.mjs';

import type { CodeLanguage } from './code-language';
const highlighter = createHighlighterCore({
	themes: [createCssVariablesTheme({ name: 'rsvelte', variablePrefix: '--shiki-', fontStyle: false })],
	langs: [svelte, vue, javascript, typescript, structuredData, stylesheet, rust],
	engine: createJavaScriptRegexEngine()
});

export async function highlight(source: string, language: CodeLanguage) {
	return (await highlighter).codeToTokens(source, { lang: language, theme: 'rsvelte' }).tokens;
}
