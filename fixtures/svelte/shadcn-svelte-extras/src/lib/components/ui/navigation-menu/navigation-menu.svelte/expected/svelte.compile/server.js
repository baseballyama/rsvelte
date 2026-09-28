import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import NavigationMenuViewport from './navigation-menu-viewport.svelte';

export default function Navigation_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			viewport = true,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (NavigationMenuPrimitive.Root) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu',
						'data-viewport': viewport,
						class: cn('group/navigation-menu relative flex max-w-max max-w-max flex-1 items-center justify-center', className)
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
							children?.($$renderer);
							$$renderer.push(`<!----> `);

							if (viewport) {
								$$renderer.push('<!--[0-->');
								NavigationMenuViewport($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
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