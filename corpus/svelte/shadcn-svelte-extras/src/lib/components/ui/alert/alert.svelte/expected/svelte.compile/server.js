import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

export const alertVariants = tv({
	base: "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
	variants: {
		variant: {
			default: 'bg-card text-card-foreground',
			destructive: 'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current'
		}
	},
	defaultVariants: { variant: 'default' }
});

export default function Alert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			variant = 'default',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'alert',
			role: 'alert',
			class: $.clsx(cn(alertVariants({ variant }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}