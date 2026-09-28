import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const badgeVariants = tv({
	base: "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none",
	variants: {
		variant: {
			default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
			secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
			destructive: "text-destructive-foreground border-transparent bg-destructive shadow hover:bg-destructive/80",
			outline: "text-foreground"
		}
	},
	defaultVariants: { variant: "default" }
});

export default function Badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			href,
			class: className,
			variant = "default",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$.element(
			$$renderer,
			href ? "a" : "span",
			() => {
				$$renderer.push(`${$.attributes({
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