import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const buttonVariants = tv({
	base: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap duration-200 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-99 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "bg-foreground text-background hover:brightness-95",
			neutral: "bg-foreground text-background hover:brightness-95",
			destructive: "text-destructive-foreground bg-destructive shadow-md hover:bg-destructive/90",
			outline: "border border-transparent bg-card text-foreground shadow-sm ring-1 shadow-black/6.5 ring-foreground/15 duration-200 hover:bg-muted/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-8 px-3 py-2",
			sm: "h-7 px-2.5 text-sm",
			lg: "h-11 px-6 text-base font-medium",
			icon: "size-9"
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

			$.attribute_effect(a, ($0) => ({ class: $0, href: href(), ...restProps }), [
				() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class)
			]);

			var node_1 = $.child(a);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(a);
			$.bind_this(a, ($$value) => ref($$value), () => ref());
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var button = root_1();

			$.attribute_effect(button, ($0) => ({ class: $0, type: type(), ...restProps }), [
				() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class)
			]);

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