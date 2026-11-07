import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import DropdownMenuPortal from "./dropdown-menu-portal.svelte";

export default function Dropdown_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			sideOffset = 4,
			align = "start",
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
									align,
									class: cn("cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-menu-translucent z-50 w-(--bits-dropdown-menu-anchor-width) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden", className)
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