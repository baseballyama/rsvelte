import * as $ from 'svelte/internal/server';
import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
import { Scrollbar } from "./index.js";
import { cn } from "$lib/utils.js";

export default function Scroll_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			viewportRef = null,
			class: className,
			orientation = "vertical",
			scrollbarXClasses = "",
			scrollbarYClasses = "",
			fade = true,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ScrollAreaPrimitive.Root) {
				$$renderer.push('<!--[-->');

				ScrollAreaPrimitive.Root($$renderer, $.spread_props([
					{ 'data-slot': 'scroll-area', class: cn("relative", className) },
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
							if (ScrollAreaPrimitive.Viewport) {
								$$renderer.push('<!--[-->');

								ScrollAreaPrimitive.Viewport($$renderer, {
									'data-slot': 'scroll-area-viewport',
									'data-orientation': orientation,
									class: cn("size-full rounded-[inherit] ring-ring/10 outline-ring/50 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 dark:ring-ring/20 dark:outline-ring/40", fade && "data-[orientation=horizontal]:overflow-x-auto data-[orientation=vertical]:overflow-y-auto", fade && "data-[orientation=horizontal]:scroll-fade-effect-x data-[orientation=vertical]:scroll-fade-effect-y"),
									get ref() {
										return viewportRef;
									},

									set ref($$value) {
										viewportRef = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										children?.($$renderer);
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (orientation === "vertical" || orientation === "both") {
								$$renderer.push('<!--[0-->');
								Scrollbar($$renderer, { orientation: 'vertical', class: scrollbarYClasses });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (orientation === "horizontal" || orientation === "both") {
								$$renderer.push('<!--[0-->');
								Scrollbar($$renderer, { orientation: 'horizontal', class: scrollbarXClasses });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (ScrollAreaPrimitive.Corner) {
								$$renderer.push('<!--[-->');
								ScrollAreaPrimitive.Corner($$renderer, {});
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
		$.bind_props($$props, { ref, viewportRef });
	});
}