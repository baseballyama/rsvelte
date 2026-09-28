import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Menubar_sub_content($$renderer, $$props) {
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
			if (MenubarPrimitive.SubContent) {
				$$renderer.push('<!--[-->');

				MenubarPrimitive.SubContent($$renderer, $.spread_props([
					{
						'data-slot': 'menubar-sub-content',
						class: cn("cn-menubar-sub-content cn-menu-target cn-menu-translucent", className)
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