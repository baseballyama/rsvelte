import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const itemVariants = tv({
	base: "cn-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
	variants: {
		variant: {
			default: "cn-item-variant-default",
			outline: "cn-item-variant-outline",
			muted: "cn-item-variant-muted"
		},
		size: {
			default: "cn-item-size-default",
			sm: "cn-item-size-sm",
			xs: "cn-item-size-xs"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'child',
	'variant',
	'size'
]);

var root = $.from_html(`<div><!></div>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const mergedProps = $.derived(() => ({
		class: cn(itemVariants({ variant: $$props.variant, size: $$props.size }), $$props.class),
		"data-slot": "item",
		"data-variant": $$props.variant,
		"data-size": $$props.size,
		...restProps
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $.get(mergedProps).children ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => ref($$value), () => ref());
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}