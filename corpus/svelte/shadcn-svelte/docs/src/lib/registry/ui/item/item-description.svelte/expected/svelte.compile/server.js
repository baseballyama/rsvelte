import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Item_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<p${$.attributes({
			'data-slot': 'item-description',
			class: $.clsx(cn("cn-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
		$.bind_props($$props, { ref });
	});
}