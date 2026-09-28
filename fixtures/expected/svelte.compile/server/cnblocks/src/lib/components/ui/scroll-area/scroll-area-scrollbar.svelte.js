import * as $ from 'svelte/internal/server';
import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Scroll_area_scrollbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			orientation = "vertical",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ScrollAreaPrimitive.Scrollbar) {
				$$renderer.push('<!--[-->');

				ScrollAreaPrimitive.Scrollbar($$renderer, $.spread_props([
					{
						'data-slot': 'scroll-area-scrollbar',
						orientation,
						class: cn("flex touch-none p-px transition-colors select-none", orientation === "vertical" && "h-full w-2.5 border-s border-s-transparent", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent", className)
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

							if (ScrollAreaPrimitive.Thumb) {
								$$renderer.push('<!--[-->');

								ScrollAreaPrimitive.Thumb($$renderer, {
									'data-slot': 'scroll-area-thumb',
									class: 'relative flex-1 rounded-full bg-border'
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
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