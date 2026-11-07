import * as $ from 'svelte/internal/server';
import { Meter as MeterPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Meter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			max = 100,
			value,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (MeterPrimitive.Root) {
				$$renderer.push('<!--[-->');

				MeterPrimitive.Root($$renderer, $.spread_props([
					{
						max,
						value,
						class: cn('relative h-2 w-full overflow-hidden rounded-full bg-(--meter-background)/20 [--meter-background:var(--primary)]', className)
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
							$$renderer.push(`<div class="h-full w-full flex-1 bg-(--meter-background) transition-[color,transform]"${$.attr_style(`transform: translateX(-${100 - 100 * (value ?? 0) / (max ?? 1)}%)`)}></div>`);
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