import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

export const badgeVariants = tv({
	base: 'focus:ring-ring inline-flex select-none items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent shadow',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent shadow',
			outline: 'text-foreground'
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