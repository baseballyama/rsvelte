import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';
import { tv } from 'tailwind-variants';

export const buttonVariants = tv({
	base: 'focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
			outline: 'border-input bg-background hover:bg-accent hover:text-accent-foreground border shadow-xs',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-9 px-4 py-2',
			sm: 'h-8 rounded-md px-3 text-xs',
			lg: 'h-10 rounded-md px-8',
			icon: 'h-9 w-9'
		}
	},
	defaultVariants: { variant: 'default', size: 'default' }
});

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			variant = 'default',
			size = 'default',
			ref = null,
			href = undefined,
			type = 'button',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				class: $.clsx(cn(buttonVariants({ variant, size }), className)),
				href,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({
				class: $.clsx(cn(buttonVariants({ variant, size }), className)),
				type,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}