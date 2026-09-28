import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const itemMediaVariants = tv({
	base: "cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
	variants: {
		variant: {
			default: "cn-item-media-variant-default",
			icon: "cn-item-media-variant-icon",
			image: "cn-item-media-variant-image"
		}
	},
	defaultVariants: { variant: "default" }
});

export default function Item_media($$renderer, $$props) {
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
			'data-slot': 'item-media',
			'data-variant': variant,
			class: $.clsx(cn(itemMediaVariants({ variant }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}