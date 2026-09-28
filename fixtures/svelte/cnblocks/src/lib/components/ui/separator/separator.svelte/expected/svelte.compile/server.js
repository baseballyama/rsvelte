import * as $ from 'svelte/internal/server';
import { Separator as SeparatorPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			orientation = "horizontal",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SeparatorPrimitive.Root) {
				$$renderer.push('<!--[-->');

				SeparatorPrimitive.Root($$renderer, $.spread_props([
					{
						class: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "min-h-full w-[1px]", className),
						orientation
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