import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Select_label($$renderer, $$props) {
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
			'data-slot': 'select-label',
			class: $.clsx(cn("text-muted-foreground px-2 py-1.5 text-xs", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}