import 'svelte/internal/disclose-version';
import core from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import memoize from 'memoize';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import { collapseString } from '../util.js';

const hljs = core.newInstance();

hljs.configure({ classPrefix: '' });
hljs.registerLanguage('javascript', javascript);

function highlightMarkup(markup) {
	return hljs.highlight(markup, { language: 'javascript' });
}

const highlight_markup = memoize(highlightMarkup);
var root = $.from_html(`<code data-testid="value"></code>`);

export default function FunctionBody($$anchor, $$props) {
	$.push($$props, true);

	let inline = $.prop($$props, 'inline', 3, false);
	let options = useOptions();

	const hljsHighlight = (markup, stringCollapse) => {
		return highlight_markup(collapseString(markup, stringCollapse)).value;
	};

	let highlighted = $.derived(() => hljsHighlight($$props.value.replaceAll('\t', ' '), options.value.stringCollapse));
	var code = root();
	let classes;

	$.html(code, () => $.get(highlighted), true);
	$.reset(code);

	$.template_effect(() => {
		$.set_attribute(code, 'title', $$props.value);
		classes = $.set_class(code, 1, 'value function hl svelte-qfgx02', null, classes, { inline: inline() });
	});

	$.append($$anchor, code);
	$.pop();
}