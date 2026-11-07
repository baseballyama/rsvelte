import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import { collapseString } from '../util.js';
import core from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import memoize from 'memoize';

const hljs = core.newInstance();

hljs.configure({ classPrefix: '' });
hljs.registerLanguage('javascript', javascript);

function highlightMarkup(markup) {
	return hljs.highlight(markup, { language: 'javascript' });
}

const highlight_markup = memoize(highlightMarkup);

export default function FunctionBody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, inline = false } = $$props;
		let options = useOptions();

		const hljsHighlight = (markup, stringCollapse) => {
			return highlight_markup(collapseString(markup, stringCollapse)).value;
		};

		let highlighted = $.derived(() => hljsHighlight(value.replaceAll('\t', ' '), options.value.stringCollapse));

		$$renderer.push(`<code data-testid="value"${$.attr('title', value)}${$.attr_class('value function hl svelte-qfgx02', void 0, { 'inline': inline })}>${$.html(highlighted())}</code>`);
	});
}