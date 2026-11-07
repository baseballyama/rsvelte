import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

export const alertVariants = tv({
	base: '[&>svg]:text-foreground relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
	variants: {
		variant: {
			default: 'bg-background text-foreground',
			destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
		}
	},
	defaultVariants: { variant: 'default' }
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
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps, role: 'alert' }), [
		() => cn(alertVariants({ variant: variant() }), $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}