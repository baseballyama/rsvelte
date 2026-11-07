import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Sidebar_menu_sub($$renderer, $$props) {
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
			'data-slot': 'sidebar-menu-sub',
			'data-sidebar': 'menu-sub',
			class: $.clsx(cn("cn-sidebar-menu-sub flex min-w-0 flex-col", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
		$.bind_props($$props, { ref });
	});
}