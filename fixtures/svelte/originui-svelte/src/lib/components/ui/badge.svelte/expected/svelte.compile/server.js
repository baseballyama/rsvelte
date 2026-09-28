import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

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

export default function Badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			variant = 'default',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn(badgeVariants({ className, variant }))),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}