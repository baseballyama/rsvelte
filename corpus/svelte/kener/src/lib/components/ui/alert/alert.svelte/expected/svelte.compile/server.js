import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const alertVariants = tv({
	base: "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
	variants: {
		variant: {
			default: "bg-card text-card-foreground",
			destructive: "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current"
		}
	},
	defaultVariants: { variant: "default" }
});

export default function Alert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			variant = "default",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'alert',
			class: $.clsx(cn(alertVariants({ variant }), className)),
			...restProps,
			role: 'alert'
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}