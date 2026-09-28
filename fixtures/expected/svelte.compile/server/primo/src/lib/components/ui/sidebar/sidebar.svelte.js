import * as $ from 'svelte/internal/server';
import * as Sheet from '$lib/components/ui/sheet/index.js';
import { cn } from '$lib/utils.ts';
import { SIDEBAR_WIDTH_MOBILE } from './constants.js';
import { useSidebar } from './context.svelte.js';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			side = 'left',
			variant = 'sidebar',
			collapsible = 'offcanvas',
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const sidebar = useSidebar();

		if (collapsible === 'none') {
			$$renderer.push(`<!--[0--><div${$.attributes({
				class: $.clsx(cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', className)),
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="text-sidebar-foreground group peer hidden md:block"${$.attr('data-state', sidebar.state)}${$.attr('data-collapsible', sidebar.state === 'collapsed' ? collapsible : '')}${$.attr('data-variant', variant)}${$.attr('data-side', side)}><div${$.attr_class($.clsx(cn('relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear', 'group-data-[collapsible=offcanvas]:w-0', 'group-data-[side=right]:rotate-180', variant === 'floating' || variant === 'inset'
				? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
				: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)')))}></div> <div${$.attributes({
				class: $.clsx(cn(
					'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
					side === 'left'
						? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
						: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
					variant === 'floating' || variant === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
						: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
					className
				)),
				...restProps
			})}><div data-sidebar="sidebar" class="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">`);

			children?.($$renderer);
			$$renderer.push(`<!----></div></div></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}