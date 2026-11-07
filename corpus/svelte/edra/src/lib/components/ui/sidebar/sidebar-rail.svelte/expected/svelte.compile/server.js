import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { useSidebar } from './context.svelte.js';

export default function Sidebar_rail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const sidebar = useSidebar();

		$$renderer.push(`<button${$.attributes({
			'data-sidebar': 'rail',
			'data-slot': 'sidebar-rail',
			'aria-label': 'Toggle Sidebar',
			tabindex: -1,
			title: 'Toggle Sidebar',
			class: $.clsx(cn('absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex', 'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize', '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize', 'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar', '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2', '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></button>`);
		$.bind_props($$props, { ref });
	});
}