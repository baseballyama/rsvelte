import * as $ from 'svelte/internal/server';
import { LinkPreview as HoverCardPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import HoverCardPortal from "./hover-card-portal.svelte";

export default function Hover_card_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			align = "center",
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
									class: cn("cn-hover-card-content z-50 origin-(--transform-origin) outline-hidden", className)
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