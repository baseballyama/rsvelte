import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const alertVariants = tv({
	base: "cn-alert group/alert relative w-full",
	variants: {
		variant: {
			default: "cn-alert-variant-default",
			destructive: "cn-alert-variant-destructive"
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
	'variant',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Alert($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ 'data-slot': 'alert', role: 'alert', class: $0, ...restProps }), [
		() => cn(alertVariants({ variant: variant() }), $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}