import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/dist/langs/bash.mjs';
import diff from 'shiki/dist/langs/diff.mjs';
import javascript from 'shiki/dist/langs/javascript.mjs';
import json from 'shiki/dist/langs/json.mjs';
import typescript from 'shiki/dist/langs/typescript.mjs';
import githubDark from 'shiki/dist/themes/github-dark.mjs';
import githubLight from 'shiki/dist/themes/github-light.mjs';

const highlighter = createHighlighterCore({
	themes: [githubLight, githubDark],
	langs: [bash, diff, javascript, json, typescript],
	engine: createJavaScriptRegexEngine()
});

export async function highlightCode(code: string, lang: string): Promise<string> {
	return (await highlighter).codeToHtml(code, {
		lang,
		themes: { light: 'github-light', dark: 'github-dark' }
	});
}
