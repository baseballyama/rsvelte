import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

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
			$$renderer.push(`<div${$.attr_class($.clsx(cn('absolute start-0 top-full isolate z-50 flex justify-center')))}>`);

			if (NavigationMenuPrimitive.Viewport) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Viewport($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-viewport',
						class: cn('bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:zoom-out-90 data-open:zoom-in-90 ring-foreground/10 origin-top-center relative mt-1.5 h-[calc(var(--bits-navigation-menu-viewport-height)+1rem)] w-full overflow-hidden rounded-lg shadow ring-1 duration-100 md:w-[calc(var(--bits-navigation-menu-viewport-width)+1rem)]', className)
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