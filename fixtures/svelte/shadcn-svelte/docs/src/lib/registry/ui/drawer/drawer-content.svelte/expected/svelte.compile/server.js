import * as $ from 'svelte/internal/server';
import { Drawer as DrawerPrimitive } from "vaul-svelte";
import { cn } from "$lib/utils.js";
import DrawerOverlay from "./drawer-overlay.svelte";
import DrawerPortal from "./drawer-portal.svelte";

export default function Drawer_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			portalProps,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DrawerPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						DrawerOverlay($$renderer, {});
						$$renderer.push(`<!----> `);

						if (DrawerPrimitive.Content) {
							$$renderer.push('<!--[-->');

							DrawerPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'drawer-content',
									class: cn("cn-drawer-content group/drawer-content fixed z-50", className)
								},
								restProps,
								{
									get ref() {
										return ref;
									},

									set ref($$value) {
										ref = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<div class="cn-drawer-handle mx-auto hidden shrink-0 bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div> `);
										children?.($$renderer);
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
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