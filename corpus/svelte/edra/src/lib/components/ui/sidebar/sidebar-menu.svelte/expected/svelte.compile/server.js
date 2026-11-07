import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Sidebar_menu($$renderer, $$props) {
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
			'data-slot': 'sidebar-menu',
			'data-sidebar': 'menu',
			class: $.clsx(cn('flex w-full min-w-0 flex-col gap-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
		$.bind_props($$props, { ref });
	});
}