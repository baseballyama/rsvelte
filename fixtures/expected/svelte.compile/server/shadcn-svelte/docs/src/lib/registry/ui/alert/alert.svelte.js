import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const alertVariants = tv({
	base: "cn-alert group/alert relative w-full",
	variants: {
		variant: {
			default: "cn-alert-variant-default",
			destructive: "cn-alert-variant-destructive"
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
			role: 'alert',
			class: $.clsx(cn(alertVariants({ variant }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}