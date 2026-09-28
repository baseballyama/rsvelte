import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<nav><!></nav>`);

export default function Calendar_nav($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var nav = root();

	$.attribute_effect(nav, ($0) => ({ ...restProps, class: $0 }), [
		() => cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1', $$props.class)
	]);

	var node = $.child(nav);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(nav);
	$.bind_this(nav, ($$value) => ref($$value), () => ref());
	$.append($$anchor, nav);
	$.pop();
}