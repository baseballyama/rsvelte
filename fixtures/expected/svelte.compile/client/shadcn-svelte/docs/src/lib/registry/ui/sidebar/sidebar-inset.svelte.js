import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<main><!></main>`);

export default function Sidebar_inset($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root();

	$.attribute_effect(main, ($0) => ({ 'data-slot': 'sidebar-inset', class: $0, ...restProps }), [
		() => cn("cn-sidebar-inset relative flex w-full flex-1 flex-col", $$props.class)
	]);

	var node = $.child(main);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(main);
	$.bind_this(main, ($$value) => ref($$value), () => ref());
	$.append($$anchor, main);
	$.pop();
}