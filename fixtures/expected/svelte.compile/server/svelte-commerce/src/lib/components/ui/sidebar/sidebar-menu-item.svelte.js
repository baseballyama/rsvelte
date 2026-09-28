import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Sidebar_menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<li${$.attributes({
			'data-sidebar': 'menu-item',
			class: $.clsx(cn('group/menu-item relative', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
		$.bind_props($$props, { ref });
	});
}