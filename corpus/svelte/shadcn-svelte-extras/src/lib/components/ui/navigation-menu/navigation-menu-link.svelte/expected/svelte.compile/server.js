import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Navigation_menu_link($$renderer, $$props) {
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
			if (NavigationMenuPrimitive.Link) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Link($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-link',
						class: cn("data-[active=true]:focus:bg-muted data-[active=true]:hover:bg-muted data-[active=true]:bg-muted/50 focus-visible:ring-ring/50 hover:bg-muted focus:bg-muted flex items-center gap-1.5 rounded-md p-2 text-sm transition-all outline-none focus-visible:ring-3 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-sm [&_svg:not([class*='size-'])]:size-4", className)
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