import 'svelte/internal/disclose-version';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import console from 'shiki/langs/console.mjs';
import css from 'shiki/langs/css.mjs';
import html from 'shiki/langs/html.mjs';
import js from 'shiki/langs/javascript.mjs';
import ts from 'shiki/langs/typescript.mjs';
import auroraX from 'shiki/themes/aurora-x.mjs';
import * as $ from 'svelte/internal/client';

const shiki = createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine(),
	themes: [auroraX],
	langs: [console, html, css, js, ts]
});

var root = $.from_html(`<div></div>`);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	let code = $.prop($$props, 'code', 3, ''),
		lang = $.prop($$props, 'lang', 3, 'console'),
		theme = $.prop($$props, 'theme', 3, 'aurora-x'),
		// Base Style Props
		base = $.prop($$props, 'base', 3, ' overflow-hidden'),
		rounded = $.prop($$props, 'rounded', 3, 'rounded-container'),
		shadow = $.prop($$props, 'shadow', 3, ''),
		classes = $.prop($$props, 'classes', 3, ''),
		// Pre Style Props
		preBase = $.prop($$props, 'preBase', 3, 'border border-surface-200-800 text-xs'),
		prePadding = $.prop($$props, 'prePadding', 3, '[&>pre]:p-4'),
		preClasses = $.prop($$props, 'preClasses', 3, '');

	const generatedHtml = $.derived(() => shiki.codeToHtml(code(), { lang: lang(), theme: theme() }));
	var div = root();

	$.html(div, () => $.get(generatedHtml), true);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `${base() ?? ''} ${rounded() ?? ''} ${shadow() ?? ''} ${classes() ?? ''} ${preBase() ?? ''} ${prePadding() ?? ''} ${preClasses() ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}