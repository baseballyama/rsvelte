import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

export const badgeVariants = tv({
	base: 'inline-flex items-center justify-center rounded-full border px-1.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] [&>svg]:shrink-0 leading-normal',
	defaultVariants: { variant: 'default' },
	variants: {
		variant: {
			default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
			destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
			outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
			secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90'
		}
	}
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref',
	'variant'
]);

var root = $.from_html(`<div><!></div>`);

export default function Badge($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => cn(badgeVariants({ className: $$props.class, variant: variant() }))
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}