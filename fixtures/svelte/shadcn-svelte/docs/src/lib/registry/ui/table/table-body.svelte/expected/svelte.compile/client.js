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

var root = $.from_html(`<tbody><!></tbody>`);

export default function Table_body($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var tbody = root();

	$.attribute_effect(tbody, ($0) => ({ 'data-slot': 'table-body', class: $0, ...restProps }), [() => cn("cn-table-body", $$props.class)]);

	var node = $.child(tbody);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tbody);
	$.bind_this(tbody, ($$value) => ref($$value), () => ref());
	$.append($$anchor, tbody);
	$.pop();
}