import * as $ from 'svelte/internal/server';
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import { cn } from "$lib/utils.js";

export default function Input_group_textarea($$renderer, $$props) {
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
			Textarea($$renderer, $.spread_props([
				{
					'data-slot': 'input-group-control',
					class: cn("cn-input-group-textarea flex-1 resize-none", className)
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