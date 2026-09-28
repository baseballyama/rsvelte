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

var root = $.from_html(`<tfoot><!></tfoot>`);

export default function Table_footer($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var tfoot = root();

	$.attribute_effect(tfoot, ($0) => ({ class: $0, ...restProps }), [
		() => cn('bg-muted/50 border-t font-medium last:[&>tr]:border-b-0', $$props.class)
	]);

	var node = $.child(tfoot);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tfoot);
	$.bind_this(tfoot, ($$value) => ref($$value), () => ref());
	$.append($$anchor, tfoot);
	$.pop();
}