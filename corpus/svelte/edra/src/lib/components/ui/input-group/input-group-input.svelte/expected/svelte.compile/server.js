import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Input } from '$lib/components/ui/input/index.js';

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
					class: cn('flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent', className)
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