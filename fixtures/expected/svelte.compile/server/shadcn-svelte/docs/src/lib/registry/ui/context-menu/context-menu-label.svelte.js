import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Context_menu_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			inset,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'context-menu-label',
			'data-inset': inset,
			class: $.clsx(cn("cn-context-menu-label data-inset:pl-8", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}