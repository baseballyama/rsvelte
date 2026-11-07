import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/components/ui/separator/index.js";
import { cn } from "$lib/utils.js";

export default function Item_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Separator($$renderer, $.spread_props([
				{
					'data-slot': 'item-separator',
					orientation: 'horizontal',
					class: cn("my-0", className)
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