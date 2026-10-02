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

var root = $.from_html(`<th><!></th>`);

export default function Table_head($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var th = root();

	$.attribute_effect(th, ($0) => ({ 'data-slot': 'table-head', class: $0, ...restProps }), [
		() => cn("h-10 bg-clip-padding px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0", $$props.class)
	]);

	var node = $.child(th);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(th);
	$.bind_this(th, ($$value) => ref($$value), () => ref());
	$.append($$anchor, th);
	$.pop();
}