import * as $ from 'svelte/internal/server';
import { Popover as PopoverPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import PopoverPortal from "./popover-portal.svelte";

export default function Popover_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			sideOffset = 4,
			align = "center",
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PopoverPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (PopoverPrimitive.Content) {
							$$renderer.push('<!--[-->');

							PopoverPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'popover-content',
									sideOffset,
									align,
									class: cn("cn-popover-content cn-popover-content-logical z-50 w-72 origin-(--transform-origin) outline-hidden", className)
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