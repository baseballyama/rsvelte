import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Navigation_menu_indicator($$renderer, $$props) {
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
			if (NavigationMenuPrimitive.Indicator) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Indicator($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-indicator',
						class: cn("cn-navigation-menu-indicator top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className)
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
							$$renderer.push(`<div class="cn-navigation-menu-indicator-arrow relative top-[60%] h-2 w-2 rotate-45"></div>`);
						},
						$$slots: { default: true }
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