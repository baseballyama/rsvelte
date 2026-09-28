import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<td${$.attributes({
			'data-slot': 'table-cell',
			class: $.clsx(cn("bg-clip-padding p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></td>`);
		$.bind_props($$props, { ref });
	});
}