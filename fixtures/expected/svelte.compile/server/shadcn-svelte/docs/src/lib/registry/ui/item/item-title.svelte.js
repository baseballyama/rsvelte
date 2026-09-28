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
			class: $.clsx(cn("cn-font-heading cn-item-title line-clamp-1 flex w-fit items-center", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}