import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Pagination_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ul${$.attributes({
			'data-slot': 'pagination-content',
			class: $.clsx(cn("cn-pagination-content flex items-center", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
		$.bind_props($$props, { ref });
	});
}