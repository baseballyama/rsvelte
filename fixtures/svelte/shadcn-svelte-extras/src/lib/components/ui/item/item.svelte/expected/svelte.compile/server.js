import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

export const itemVariants = tv({
	base: '[a]:hover:bg-muted group/item focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-wrap items-center rounded-md border text-sm transition-colors duration-100 outline-none focus-visible:ring-[3px] [a]:transition-colors',
	variants: {
		variant: {
			default: 'border-transparent',
			outline: 'border-border',
			muted: 'bg-muted/50 border-transparent'
		},
		size: {
			default: 'gap-3.5 px-4 py-3.5',
			sm: 'gap-2.5 px-3 py-2.5',
			xs: 'gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0'
		}
	},
	defaultVariants: { variant: 'default', size: 'default' }
});

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			child,
			variant,
			size,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => ({
			class: cn(itemVariants({ variant, size }), className),
			'data-slot': 'item',
			'data-variant': variant,
			'data-size': size,
			...restProps
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			mergedProps().children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}