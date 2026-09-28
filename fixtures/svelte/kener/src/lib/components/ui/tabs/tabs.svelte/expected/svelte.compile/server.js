import * as $ from 'svelte/internal/server';
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = "",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (TabsPrimitive.Root) {
				$$renderer.push('<!--[-->');

				TabsPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': 'tabs',
						class: cn("flex flex-col gap-2", className)
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

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
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
		$.bind_props($$props, { ref, value });
	});
}