import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Picker_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { inset, class: className, $$slots, $$events, ...restProps } = $$props;

		if (DropdownMenuPrimitive.GroupHeading) {
			$$renderer.push('<!--[-->');

			DropdownMenuPrimitive.GroupHeading($$renderer, $.spread_props([
				{
					'data-slot': 'dropdown-menu-label',
					'data-inset': inset,
					class: cn("px-2 py-1.5 text-xs font-medium text-neutral-400 data-inset:pl-8", className)
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