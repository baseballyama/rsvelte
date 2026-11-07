import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

export const badgeVariants = tv({
	base: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
			secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
			destructive: 'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white',
			outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
		}
	},
	defaultVariants: { variant: 'default' }
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
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $$props.href ? 'a' : 'span', false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => ref($$value), () => ref());

		$.attribute_effect(
			$$element,
			($0) => ({
				'data-slot': 'badge',
				href: $$props.href,
				class: $0,
				...restProps
			}),
			[
				() => cn(badgeVariants({ variant: variant() }), $$props.class)
			]
		);

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}