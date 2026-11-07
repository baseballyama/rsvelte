import * as $ from 'svelte/internal/server';
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

export default function Input_group_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			$$slots,
			$$events,
			...props
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Input($$renderer, $.spread_props([
				{
					'data-slot': 'input-group-control',
					class: cn("cn-input-group-input flex-1", className)
				},
				props,
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