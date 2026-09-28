import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<nav><!></nav>`);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 11, null),
		restProps = $.rest_props($$props, rest_excludes);

	var nav = root();

	$.attribute_effect(nav, ($0) => ({ 'aria-label': 'pagination', class: $0, ...restProps }), [
		() => cn('mx-auto flex w-full justify-center', $$props.class)
	]);

	var node = $.child(nav);

	$.snippet(node, () => $$props.children);
	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}