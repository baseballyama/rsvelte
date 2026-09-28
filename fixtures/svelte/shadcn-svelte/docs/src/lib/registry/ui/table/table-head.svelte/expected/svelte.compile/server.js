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
			class: $.clsx(cn("cn-table-head", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
		$.bind_props($$props, { ref });
	});
}