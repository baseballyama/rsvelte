import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const badgeVariants = tv({
	base: "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none",
	variants: {
		variant: {
			default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
			secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
			destructive: "text-destructive-foreground border-transparent bg-destructive shadow hover:bg-destructive/80",
			outline: "text-foreground"
		}
	},
	defaultVariants: { variant: "default" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'href',
	'class',
	'variant',
	'children'
]);

export default function Badge($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $$props.href ? "a" : "span", false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => ref($$value), () => ref());

		$.attribute_effect($$element, ($0) => ({ href: $$props.href, class: $0, ...restProps }), [
			() => cn(badgeVariants({ variant: variant() }), $$props.class)
		]);

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}