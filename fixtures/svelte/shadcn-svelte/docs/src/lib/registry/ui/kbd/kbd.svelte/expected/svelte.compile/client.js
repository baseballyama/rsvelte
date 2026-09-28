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

var root = $.from_html(`<kbd><!></kbd>`);

export default function Kbd($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var kbd = root();

	$.attribute_effect(kbd, ($0) => ({ 'data-slot': 'kbd', class: $0, ...restProps }), [
		() => cn("cn-kbd pointer-events-none inline-flex items-center justify-center select-none", $$props.class)
	]);

	var node = $.child(kbd);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(kbd);
	$.bind_this(kbd, ($$value) => ref($$value), () => ref());
	$.append($$anchor, kbd);
	$.pop();
}