import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

export default function Button_group_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			orientation = "vertical",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Separator($$renderer, $.spread_props([
				{
					'data-slot': 'button-group-separator',
					orientation,
					class: cn("cn-button-group-separator relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto", className)
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