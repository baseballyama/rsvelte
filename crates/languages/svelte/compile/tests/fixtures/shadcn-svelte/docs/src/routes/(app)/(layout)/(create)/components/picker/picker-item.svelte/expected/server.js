import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Picker_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			inset,
			variant = "default",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (DropdownMenuPrimitive.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenuPrimitive.Item($$renderer, $.spread_props([
				{
					'data-slot': 'dropdown-menu-item',
					'data-inset': inset,
					'data-variant': variant,
					class: cn("group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 data-inset:pl-8 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [[data-slot=dropdown-menu-sub-content]_&]:focus:bg-accent [[data-slot=dropdown-menu-sub-content]_&]:focus:text-accent-foreground [[data-slot=dropdown-menu-sub-content]_&]:focus:**:text-accent-foreground", className)
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}