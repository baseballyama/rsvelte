import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Select_scroll_down_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.ScrollDownButton) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.ScrollDownButton($$renderer, $.spread_props([
					{
						class: cn('flex cursor-default items-center justify-center py-1', className)
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
							ChevronDown($$renderer, { size: 16 });
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