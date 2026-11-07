import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

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
			'data-sidebar': 'menu-sub',
			class: $.clsx(cn('mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border py-0.5 pl-2.5', 'group-data-[collapsible=icon]:hidden', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
		$.bind_props($$props, { ref });
	});
}