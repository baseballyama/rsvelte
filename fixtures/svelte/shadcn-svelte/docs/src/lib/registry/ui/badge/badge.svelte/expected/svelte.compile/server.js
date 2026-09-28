import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const badgeVariants = tv({
	base: "cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
	variants: {
		variant: {
			default: "cn-badge-variant-default",
			secondary: "cn-badge-variant-secondary",
			destructive: "cn-badge-variant-destructive",
			outline: "cn-badge-variant-outline",
			ghost: "cn-badge-variant-ghost",
			link: "cn-badge-variant-link"
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