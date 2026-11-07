import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Navigation_menu_viewport($$renderer, $$props) {
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
			$$renderer.push(`<div${$.attr_class($.clsx(cn("absolute start-0 top-full isolate z-50 flex justify-center")))}>`);

			if (NavigationMenuPrimitive.Viewport) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Viewport($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-viewport',
						class: cn("origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--bits-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--bits-navigation-menu-viewport-width)]", className)
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

			$$renderer.push(`</div>`);
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