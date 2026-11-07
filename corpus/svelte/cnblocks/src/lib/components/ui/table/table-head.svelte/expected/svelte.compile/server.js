import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table_head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<th${$.attributes({
			'data-slot': 'table-head',
			class: $.clsx(cn("h-10 bg-clip-padding px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
		$.bind_props($$props, { ref });
	});
}