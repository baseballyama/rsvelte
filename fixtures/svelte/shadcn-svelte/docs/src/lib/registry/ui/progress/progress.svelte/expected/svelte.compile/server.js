import * as $ from 'svelte/internal/server';
import { Progress as ProgressPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Progress($$renderer, $$props) {
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
			if (ProgressPrimitive.Root) {
				$$renderer.push('<!--[-->');

				ProgressPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': 'progress',
						class: cn("cn-progress relative flex w-full items-center overflow-x-hidden", className),
						value,
						max
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
							$$renderer.push(`<div data-slot="progress-indicator" class="cn-progress-indicator size-full flex-1 transition-all"${$.attr_style(`transform: translateX(-${$.stringify(100 - 100 * (value ?? 0) / (max ?? 1))}%)`)}></div>`);
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