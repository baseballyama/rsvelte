import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils/index.js';

export const buttonVariants = tv({
	base: 'focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-radius text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground shadow',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
			outline: 'border-input bg-background border shadow-sm',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
			ghost: 'hover:border-primary border border-transparent hover:text-primary',
			link: 'text-primary underline-offset-4 hover:underline',
			plain: ''
		},
		size: {
			default: 'h-9 px-4 py-2',
			sm: 'h-8 rounded-radius px-3 text-xs',
			lg: 'h-10 rounded-radius px-8',
			icon: 'h-9 w-9'
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

			$.attribute_effect(a, ($0) => ({ class: $0, href: href(), ...restProps }), [
				() => cn('ed-btn-base', buttonVariants({ variant: variant(), size: size() }), $$props.class)
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
				() => cn('ed-btn-base', buttonVariants({ variant: variant(), size: size() }), $$props.class)
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