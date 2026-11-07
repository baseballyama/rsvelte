import * as $ from 'svelte/internal/server';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const highlighter = await createHighlighterCore({
	langs: [
		import('@shikijs/langs/bash'),
		import('@shikijs/langs/css'),
		import('@shikijs/langs/html'),
		import('@shikijs/langs/javascript')
	],
	themes: [import('@shikijs/themes/github-dark')],
	engine: createJavaScriptRegexEngine()
});

export default function Code_block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			code = '',
			lang = 'txt',
			// Base Style Props
			base = ' overflow-hidden',
			rounded = 'rounded-container',
			shadow = '',
			classes = '',
			// Pre Style Props
			preBase = '',
			prePadding = '',
			preClasses = ''
		} = $$props;

		const generatedHtml = highlighter.codeToHtml(code, { lang, theme: 'github-dark' });

		$$renderer.push(`<div${$.attr_class(`${$.stringify(base)} ${$.stringify(rounded)} ${$.stringify(shadow)} ${$.stringify(classes)} ${$.stringify(preBase)} ${$.stringify(prePadding)} ${$.stringify(preClasses)}`)}>${$.html(generatedHtml)}</div>`);
	});
}