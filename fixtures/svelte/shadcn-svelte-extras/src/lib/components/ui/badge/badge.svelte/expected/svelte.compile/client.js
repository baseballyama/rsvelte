import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

export const badgeVariants = tv({
	base: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all transition-colors focus-visible:ring-[3px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!',
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
			secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
			destructive: 'bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20',
			outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
			ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
			link: 'text-primary underline-offset-4 hover:underline'
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