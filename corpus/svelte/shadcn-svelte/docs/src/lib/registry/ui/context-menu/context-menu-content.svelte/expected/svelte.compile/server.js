import * as $ from 'svelte/internal/server';
import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import ContextMenuPortal from "./context-menu-portal.svelte";

export default function Context_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			portalProps,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ContextMenuPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (ContextMenuPrimitive.Content) {
							$$renderer.push('<!--[-->');

							ContextMenuPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'context-menu-content',
									class: cn("cn-context-menu-content cn-menu-target cn-menu-translucent z-50 overflow-x-hidden overflow-y-auto outline-none", className)
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