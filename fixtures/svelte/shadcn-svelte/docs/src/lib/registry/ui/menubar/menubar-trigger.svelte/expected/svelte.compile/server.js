import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Menubar_trigger($$renderer, $$props) {
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
			if (MenubarPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				MenubarPrimitive.Trigger($$renderer, $.spread_props([
					{
						'data-slot': 'menubar-trigger',
						class: cn("cn-menubar-trigger flex items-center outline-hidden select-none", className)
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