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

var root = $.from_html(`<p><!></p>`);

export default function Card_description($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var p = root();

	$.attribute_effect(p, ($0) => ({ class: $0, ...restProps }), [() => cn("text-sm text-muted-foreground", $$props.class)]);

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.bind_this(p, ($$value) => ref($$value), () => ref());
	$.append($$anchor, p);
	$.pop();
}