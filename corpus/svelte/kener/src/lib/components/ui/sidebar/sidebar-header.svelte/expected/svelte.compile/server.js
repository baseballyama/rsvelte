import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Sidebar_header($$renderer, $$props) {
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
			'data-slot': 'sidebar-header',
			'data-sidebar': 'header',
			class: $.clsx(cn("flex flex-col gap-2 p-2", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}