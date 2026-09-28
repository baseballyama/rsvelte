import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
	defaultVariants: { size: 'default', variant: 'default' },
	variants: {
		size: {
			default: 'h-9 px-4 py-2',
			icon: 'size-9',
			lg: 'h-10 rounded-md px-8',
			sm: 'h-8 rounded-md px-3 text-xs'
		},
		variant: {
			default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
			destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline',
			outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
			secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80'
		}
	}
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'href',
	'ref',
	'size',
	'variant'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<a><!></a>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let href = $.prop($$props, 'href', 3, null),
		ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, 'default'),
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, ($0) => ({ type: 'button', class: $0, ...restProps }), [
				() => cn(buttonVariants({ className: $$props.class, size: size(), variant: variant() }))
			]);

			var node_1 = $.child(button);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(button);
			$.bind_this(button, ($$value) => ref($$value), () => ref());
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var a = root_1();

			$.attribute_effect(a, ($0) => ({ href: href(), class: $0, ...restProps }), [
				() => cn(buttonVariants({ className: $$props.class, size: size(), variant: variant() }))
			]);

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(a);
			$.bind_this(a, ($$value) => ref($$value), () => ref());
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if (!href() && $$props?.role !== 'link') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}