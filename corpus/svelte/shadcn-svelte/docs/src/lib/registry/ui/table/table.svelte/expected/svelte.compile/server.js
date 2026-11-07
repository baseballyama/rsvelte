import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div data-slot="table-container" class="cn-table-container"><table${$.attributes({
			'data-slot': 'table',
			class: $.clsx(cn("cn-table", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
		$.bind_props($$props, { ref });
	});
}