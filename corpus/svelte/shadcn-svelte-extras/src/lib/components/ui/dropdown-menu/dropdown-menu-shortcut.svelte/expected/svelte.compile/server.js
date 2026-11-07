import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Dropdown_menu_shortcut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			'data-slot': 'dropdown-menu-shortcut',
			class: $.clsx(cn('text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { ref });
	});
}