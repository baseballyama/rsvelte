import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

export default function Navigation_menu_list($$renderer, $$props) {
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
			if (NavigationMenuPrimitive.List) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.List($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-list',
						class: cn('group flex flex-1 list-none items-center justify-center gap-1', className)
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