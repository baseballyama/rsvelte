import 'svelte/internal/disclose-version';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div></div>`);

export default function Code_block($$anchor, $$props) {
	$.push($$props, true);

	const code = $.prop($$props, 'code', 3, ''),
		lang = $.prop($$props, 'lang', 3, 'txt'),
		// Base Style Props
		base = $.prop($$props, 'base', 3, ' overflow-hidden'),
		rounded = $.prop($$props, 'rounded', 3, 'rounded-container'),
		shadow = $.prop($$props, 'shadow', 3, ''),
		classes = $.prop($$props, 'classes', 3, ''),
		// Pre Style Props
		preBase = $.prop($$props, 'preBase', 3, ''),
		prePadding = $.prop($$props, 'prePadding', 3, ''),
		preClasses = $.prop($$props, 'preClasses', 3, '');

	const generatedHtml = highlighter.codeToHtml(code(), { lang: lang(), theme: 'github-dark' });
	var div = root();

	$.html(div, () => generatedHtml, true);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `${base() ?? ''} ${rounded() ?? ''} ${shadow() ?? ''} ${classes() ?? ''} ${preBase() ?? ''} ${prePadding() ?? ''} ${preClasses() ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}