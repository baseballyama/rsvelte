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

var root = $.from_html(`<td><!></td>`);

export default function Table_cell($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var td = root();

	$.attribute_effect(td, ($0) => ({ 'data-slot': 'table-cell', class: $0, ...restProps }), [() => cn("cn-table-cell", $$props.class)]);

	var node = $.child(td);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(td);
	$.bind_this(td, ($$value) => ref($$value), () => ref());
	$.append($$anchor, td);
	$.pop();
}