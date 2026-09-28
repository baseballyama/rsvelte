import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Dropdown_menu_label($$renderer, $$props) {
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
			'data-slot': 'dropdown-menu-label',
			'data-inset': inset,
			class: $.clsx(cn('text-muted-foreground px-2 py-1.5 text-xs font-medium data-inset:pl-8 data-[inset]:pl-8', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}