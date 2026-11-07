import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table_row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tr${$.attributes({
			'data-slot': 'table-row',
			class: $.clsx(cn("cn-table-row", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
		$.bind_props($$props, { ref });
	});
}