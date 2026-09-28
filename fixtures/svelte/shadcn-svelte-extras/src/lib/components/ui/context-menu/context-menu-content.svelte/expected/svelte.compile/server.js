import * as $ from 'svelte/internal/server';
import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import ContextMenuPortal from './context-menu-portal.svelte';

export default function Context_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			portalProps,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ContextMenuPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (ContextMenuPrimitive.Content) {
							$$renderer.push('<!--[-->');

							ContextMenuPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'context-menu-content',
									class: cn('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground z-50 min-w-36 overflow-x-hidden overflow-y-auto rounded-md p-1 shadow-md ring-1 duration-100 outline-none', className)
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
					},
					$$slots: { default: true }
				}
			]));
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