import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

export default function Dropdown_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			sideOffset = 4,
			portalProps,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DropdownMenuPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (DropdownMenuPrimitive.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenuPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'dropdown-menu-content',
									sideOffset,
									class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--bits-dropdown-menu-content-available-height) min-w-[8rem] origin-(--bits-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none", className)
								},
								restProps,
								{
									get ref() {
										return ref;
									},

									set ref($$value) {
										ref = $$value;
										$$settled = false;
									}
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}