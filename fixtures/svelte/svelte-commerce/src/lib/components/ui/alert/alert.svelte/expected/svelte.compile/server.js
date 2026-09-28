import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';
import { tv } from 'tailwind-variants';

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
			class: $.clsx(cn(alertVariants({ variant }), className)),
			...restProps,
			role: 'alert'
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}