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

var root = $.from_html(`<thead><!></thead>`);

export default function Table_header($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var thead = root();

	$.attribute_effect(thead, ($0) => ({ class: $0, ...restProps }), [() => cn($$props.class)]);

	var node = $.child(thead);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(thead);
	$.bind_this(thead, ($$value) => ref($$value), () => ref());
	$.append($$anchor, thead);
	$.pop();
}