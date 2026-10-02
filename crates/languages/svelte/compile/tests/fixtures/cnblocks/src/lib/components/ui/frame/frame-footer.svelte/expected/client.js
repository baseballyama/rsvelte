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

var root = $.from_html(`<footer><!></footer>`);

export default function Frame_footer($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var footer = root();

	$.attribute_effect(footer, ($0) => ({ 'data-slot': 'frame-panel-footer', class: $0, ...restProps }), [() => cn("px-5 py-4", $$props.class)]);

	var node = $.child(footer);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(footer);
	$.bind_this(footer, ($$value) => ref($$value), () => ref());
	$.append($$anchor, footer);
	$.pop();
}