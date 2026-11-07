import 'svelte/internal/disclose-version';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';

export const buttonVariants = tv({
	base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
			outline: 'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
			ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
			destructive: 'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
			xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
			lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
			icon: 'size-8',
			'icon-xs': "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
			'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
			'icon-lg': 'size-9'
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
					rel: 'external',
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