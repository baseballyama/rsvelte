import 'svelte/internal/disclose-version';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';

export const buttonVariants = tv({
	base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
			destructive: 'bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white',
			outline: 'bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
			secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
			ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-9 px-4 py-2 has-[>svg]:px-3',
			sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
			action: 'h-7 gap-1.5 rounded-md pl-2 pr-1 has-[>svg]:px-2.5',
			lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
			icon: 'size-9'
		}
	},
	defaultVariants: { variant: 'default', size: 'default' }
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

	let variant = $.prop($$props, 'variant', 3, 'default'),
		size = $.prop($$props, 'size', 3, 'default'),
		ref = $.prop($$props, 'ref', 15, null),
		href = $.prop($$props, 'href', 3, undefined),
		type = $.prop($$props, 'type', 3, 'button'),
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
					role: $$props.disabled ? 'link' : undefined,
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