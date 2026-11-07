import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<div class="relative w-full overflow-auto"><table><!></table></div>`);

export default function Table($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var table = $.child(div);

	$.attribute_effect(table, ($0) => ({ class: $0, ...restProps }), [() => cn('w-full caption-bottom text-sm', $$props.class)]);

	var node = $.child(table);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(table);
	$.bind_this(table, ($$value) => ref($$value), () => ref());
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}