import * as $ from 'svelte/internal/server';
import { Tooltip as TooltipPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import TooltipPortal from "./tooltip-portal.svelte";

export default function Tooltip_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			sideOffset = 0,
			side = "top",
			children,
			arrowClasses,
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TooltipPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (TooltipPrimitive.Content) {
							$$renderer.push('<!--[-->');

							TooltipPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'tooltip-content',
									sideOffset,
									side,
									class: cn("cn-tooltip-content z-50 w-fit max-w-xs origin-(--bits-tooltip-content-transform-origin) bg-foreground text-background", className)
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

										{
											function child($$renderer, { props }) {
												$$renderer.push(`<div${$.attributes({
													class: $.clsx(cn("cn-tooltip-arrow z-50 bg-foreground fill-foreground", "data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%+2px)]", "data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%+1px)]", "data-[side=right]:translate-x-[calc(50%+2px)] data-[side=right]:translate-y-1/2", "data-[side=left]:-translate-y-[calc(50%-3px)]", arrowClasses)),
													...props
												})}></div>`);
											}

											if (TooltipPrimitive.Arrow) {
												$$renderer.push('<!--[-->');
												TooltipPrimitive.Arrow($$renderer, { child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}
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