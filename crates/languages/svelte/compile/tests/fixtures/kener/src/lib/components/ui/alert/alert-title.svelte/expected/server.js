import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Alert_title($$renderer, $$props) {
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
			'data-slot': 'alert-title',
			class: $.clsx(cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}