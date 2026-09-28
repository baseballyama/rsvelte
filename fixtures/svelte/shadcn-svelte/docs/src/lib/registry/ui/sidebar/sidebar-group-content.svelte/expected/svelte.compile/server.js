import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Sidebar_group_content($$renderer, $$props) {
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
			'data-slot': 'sidebar-group-content',
			'data-sidebar': 'group-content',
			class: $.clsx(cn("cn-sidebar-group-content w-full", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}