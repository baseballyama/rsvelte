import * as $ from 'svelte/internal/server';
import { Input } from '$lib/components/ui/input/index.js';
import { cn } from '$lib/core/utils';

export default function Sidebar_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = '',
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Input($$renderer, $.spread_props([
				{
					'data-sidebar': 'input',
					class: cn('h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring', className)
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