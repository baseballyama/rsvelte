import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

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

export default function Badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			href,
			class: className,
			variant = 'default',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$.element(
			$$renderer,
			href ? 'a' : 'span',
			() => {
				$$renderer.push(`${$.attributes({
					'data-slot': 'badge',
					href,
					class: $.clsx(cn(badgeVariants({ variant }), className)),
					...restProps
				})}`);
			},
			() => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}
		);

		$.bind_props($$props, { ref });
	});
}