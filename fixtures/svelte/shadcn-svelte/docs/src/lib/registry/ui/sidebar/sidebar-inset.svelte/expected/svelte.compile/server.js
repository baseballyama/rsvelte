import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Sidebar_inset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<main${$.attributes({
			'data-slot': 'sidebar-inset',
			class: $.clsx(cn("cn-sidebar-inset relative flex w-full flex-1 flex-col", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
		$.bind_props($$props, { ref });
	});
}