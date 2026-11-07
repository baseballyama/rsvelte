import * as $ from 'svelte/internal/server';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import console from 'shiki/langs/console.mjs';
import css from 'shiki/langs/css.mjs';
import html from 'shiki/langs/html.mjs';
import js from 'shiki/langs/javascript.mjs';
import ts from 'shiki/langs/typescript.mjs';
import auroraX from 'shiki/themes/aurora-x.mjs';

const shiki = createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine(),
	themes: [auroraX],
	langs: [console, html, css, js, ts]
});

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			code = '',
			lang = 'console',
			theme = 'aurora-x',
			// Base Style Props
			base = ' overflow-hidden',
			rounded = 'rounded-container',
			shadow = '',
			classes = '',
			// Pre Style Props
			preBase = 'border border-surface-200-800 text-xs',
			prePadding = '[&>pre]:p-4',
			preClasses = ''
		} = $$props;

		const generatedHtml = $.derived(() => shiki.codeToHtml(code, { lang, theme }));

		$$renderer.push(`<div${$.attr_class(`${$.stringify(base)} ${$.stringify(rounded)} ${$.stringify(shadow)} ${$.stringify(classes)} ${$.stringify(preBase)} ${$.stringify(prePadding)} ${$.stringify(preClasses)}`)}>${$.html(generatedHtml())}</div>`);
	});
}