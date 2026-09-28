import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'size'
]);

var root = $.from_html(`<div><!></div>`);

export default function Card($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'card',
			'data-size': size(),
			class: $0,
			...restProps
		}),
		[
			() => cn('ring-foreground/10 bg-card text-card-foreground group/card overflow-card flex flex-col gap-6 rounded-xl py-6 text-sm shadow-xs ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl', $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}