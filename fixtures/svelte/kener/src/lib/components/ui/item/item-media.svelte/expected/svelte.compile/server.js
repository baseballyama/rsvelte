import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const itemMediaVariants = tv({
	base: "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
	variants: {
		variant: {
			default: "bg-transparent",
			icon: "bg-muted size-8 rounded-sm border [&_svg:not([class*='size-'])]:size-4",
			image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover"
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