import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tfoot${$.attributes({
			'data-slot': 'table-footer',
			class: $.clsx(cn("cn-table-footer", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tfoot>`);
		$.bind_props($$props, { ref });
	});
}