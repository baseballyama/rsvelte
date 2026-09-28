import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Sidebar_menu_sub_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			children,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<li${$.attributes({
			'data-slot': 'sidebar-menu-sub-item',
			'data-sidebar': 'menu-sub-item',
			class: $.clsx(cn('group/menu-sub-item relative', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
		$.bind_props($$props, { ref });
	});
}