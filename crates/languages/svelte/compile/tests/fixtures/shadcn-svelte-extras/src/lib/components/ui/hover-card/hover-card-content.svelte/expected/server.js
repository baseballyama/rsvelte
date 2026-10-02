import * as $ from 'svelte/internal/server';
import { LinkPreview as HoverCardPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import HoverCardPortal from './hover-card-portal.svelte';

export default function Hover_card_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			align = 'center',
			sideOffset = 4,
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			HoverCardPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (HoverCardPrimitive.Content) {
							$$renderer.push('<!--[-->');

							HoverCardPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'hover-card-content',
									align,
									sideOffset,
									class: cn('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground z-50 w-64 origin-(--transform-origin) rounded-lg p-4 text-sm shadow-md ring-1 outline-hidden duration-100', className)
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