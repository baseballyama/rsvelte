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

var root = $.from_html(`<header><!></header>`);

export default function Frame_header($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var header = root();

	$.attribute_effect(header, ($0) => ({ 'data-slot': 'frame-panel-header', class: $0, ...restProps }), [() => cn("flex flex-col px-5 py-4", $$props.class)]);

	var node = $.child(header);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(header);
	$.bind_this(header, ($$value) => ref($$value), () => ref());
	$.append($$anchor, header);
	$.pop();
}