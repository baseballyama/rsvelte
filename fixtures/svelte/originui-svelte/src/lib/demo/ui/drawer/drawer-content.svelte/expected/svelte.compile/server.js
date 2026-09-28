import * as $ from 'svelte/internal/server';
import DrawerOverlay from './drawer-overlay.svelte';
import { cn } from '$lib/utils.js';
import { Drawer as DrawerPrimitive } from 'vaul-svelte';

export default function Drawer_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DrawerPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				DrawerPrimitive.Portal($$renderer, {
					children: ($$renderer) => {
						DrawerOverlay($$renderer, {});
						$$renderer.push(`<!----> `);

						if (DrawerPrimitive.Content) {
							$$renderer.push('<!--[-->');

							DrawerPrimitive.Content($$renderer, $.spread_props([
								{
									class: cn('border-border bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-(--radius) border', className)
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
										$$renderer.push(`<div class="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full"></div> `);
										children?.($$renderer);
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

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