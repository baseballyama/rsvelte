import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import { cn } from "$lib/utils.js";
import * as $ from 'svelte/internal/client';

export const buttonVariants = tv({
	base: "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "cn-button-variant-default",
			outline: "cn-button-variant-outline",
			secondary: "cn-button-variant-secondary",
			ghost: "cn-button-variant-ghost",
			destructive: "cn-button-variant-destructive",
			link: "cn-button-variant-link"
		},
		size: {
			default: "cn-button-size-default",
			xs: "cn-button-size-xs",
			sm: "cn-button-size-sm",
			lg: "cn-button-size-lg",
			icon: "cn-button-size-icon",
			"icon-xs": "cn-button-size-icon-xs",
			"icon-sm": "cn-button-size-icon-sm",
			"icon-lg": "cn-button-size-icon-lg"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'variant',
	'size',
	'ref',
	'href',
	'type',
	'disabled',
	'children'
]);

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<button><!></button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "default"),
		size = $.prop($$props, 'size', 3, "default"),
		ref = $.prop($$props, 'ref', 15, null),
		href = $.prop($$props, 'href', 3, undefined),
		type = $.prop($$props, 'type', 3, "button"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();

			$.attribute_effect(
				a,
				($0) => ({
					'data-slot': 'button',
					class: $0,
					href: $$props.disabled ? undefined : href(),
					'aria-disabled': $$props.disabled,
					role: $$props.disabled ? "link" : undefined,
					tabindex: $$props.disabled ? -1 : undefined,
					...restProps
				}),
				[
					() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class)
				]
			);

			var node_1 = $.child(a);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(a);
			$.bind_this(a, ($$value) => ref($$value), () => ref());
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var button = root_1();

			$.attribute_effect(
				button,
				($0) => ({
					'data-slot': 'button',
					class: $0,
					type: type(),
					disabled: $$props.disabled,
					...restProps
				}),
				[
					() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class)
				]
			);

			var node_2 = $.child(button);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(button);
			$.bind_this(button, ($$value) => ref($$value), () => ref());
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (href()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}