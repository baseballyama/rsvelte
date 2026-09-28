import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

export default function Navigation_menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (NavigationMenuPrimitive.Item) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Item($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-item',
						class: cn('relative', className)
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