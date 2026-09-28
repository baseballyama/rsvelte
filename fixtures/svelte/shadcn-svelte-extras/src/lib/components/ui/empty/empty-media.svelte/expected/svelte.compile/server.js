import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

export const emptyMediaVariants = tv({
	base: 'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
	variants: {
		variant: {
			default: 'bg-transparent',
			icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
		}
	},
	defaultVariants: { variant: 'default' }
});

export default function Empty_media($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			variant = 'default',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'empty-icon',
			'data-variant': variant,
			class: $.clsx(cn(emptyMediaVariants({ variant }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}