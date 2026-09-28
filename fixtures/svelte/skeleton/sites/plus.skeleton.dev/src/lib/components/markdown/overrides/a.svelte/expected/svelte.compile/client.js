import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<a><!></a>`);

export default function A($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	const isExternal = $.derived(() => $$props.href && !$$props.href.startsWith('/') && !$$props.href.startsWith('#'));
	var a = root();

	$.attribute_effect(a, () => ({
		class: 'anchor',
		target: $.get(isExternal) ? '_blank' : undefined,
		rel: $.get(isExternal) ? 'noopener noreferrer' : undefined,
		...rest
	}));

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}