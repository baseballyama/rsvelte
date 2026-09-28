import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const cardVariants = tv({
	base: "rounded-xl text-card-foreground",
	variants: {
		variant: {
			default: "border border-transparent bg-card shadow ring-1 ring-foreground/5",
			soft: "bg-foreground/5",
			mixed: "border-foreground.5 border bg-foreground/5"
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