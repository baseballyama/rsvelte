import * as $ from 'svelte/internal/server';
import { Drawer as DrawerPrimitive } from "vaul-svelte";
import { cn } from "$lib/utils.js";

export default function Drawer_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DrawerPrimitive.Description) {
				$$renderer.push('<!--[-->');

				DrawerPrimitive.Description($$renderer, $.spread_props([
					{
						'data-slot': 'drawer-description',
						class: cn("cn-drawer-description", className)
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