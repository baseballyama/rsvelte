import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const emptyMediaVariants = tv({
	base: "cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "cn-empty-media-default",
			icon: "cn-empty-media-icon"
		}
	},
	defaultVariants: { variant: "default" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'variant'
]);

var root = $.from_html(`<div><!></div>`);

export default function Empty_media($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'empty-icon',
			'data-variant': variant(),
			class: $0,
			...restProps
		}),
		[
			() => cn(emptyMediaVariants({ variant: variant() }), $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}