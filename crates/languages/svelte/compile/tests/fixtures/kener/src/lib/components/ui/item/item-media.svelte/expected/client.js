import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const itemMediaVariants = tv({
	base: "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
	variants: {
		variant: {
			default: "bg-transparent",
			icon: "bg-muted size-8 rounded-sm border [&_svg:not([class*='size-'])]:size-4",
			image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover"
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

export default function Item_media($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'item-media',
			'data-variant': variant(),
			class: $0,
			...restProps
		}),
		[
			() => cn(itemMediaVariants({ variant: variant() }), $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}