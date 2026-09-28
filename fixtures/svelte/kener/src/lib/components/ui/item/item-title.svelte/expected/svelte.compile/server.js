import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Item_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'item-title',
			class: $.clsx(cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}