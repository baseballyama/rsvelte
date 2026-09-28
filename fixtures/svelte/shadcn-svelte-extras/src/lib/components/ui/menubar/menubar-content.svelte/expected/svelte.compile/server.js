import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from 'bits-ui';
import MenubarPortal from './menubar-portal.svelte';
import { cn } from '$lib/utils.js';

export default function Menubar_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			sideOffset = 8,
			alignOffset = -4,
			align = 'start',
			side = 'bottom',
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MenubarPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (MenubarPrimitive.Content) {
							$$renderer.push('<!--[-->');

							MenubarPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'menubar-content',
									align,
									alignOffset,
									side,
									sideOffset,
									class: cn('bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 z-50 min-w-36 origin-(--bits-menubar-content-transform-origin) overflow-hidden rounded-lg p-1 shadow-md ring-1 duration-100', className)
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