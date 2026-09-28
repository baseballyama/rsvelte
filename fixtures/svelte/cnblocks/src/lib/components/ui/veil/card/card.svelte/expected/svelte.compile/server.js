import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const cardVariants = tv({
	base: "rounded-2xl text-card-foreground",
	variants: {
		variant: {
			default: "bg-card shadow-lg ring-1 shadow-foreground/5 ring-foreground/6.5 dark:shadow-black/10",
			soft: "bg-muted",
			mixed: "border bg-muted",
			outline: "bg-card ring-1 ring-border"
		}
	},
	defaultVariants: { variant: "default" }
});

export default function Card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			variant = "default",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn(cardVariants({ variant }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}