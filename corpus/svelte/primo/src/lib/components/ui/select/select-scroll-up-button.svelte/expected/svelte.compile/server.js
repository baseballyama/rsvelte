import * as $ from 'svelte/internal/server';
import ChevronUp from 'lucide-svelte/icons/chevron-up';
import { Select as SelectPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Select_scroll_up_button($$renderer, $$props) {
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
			if (SelectPrimitive.ScrollUpButton) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.ScrollUpButton($$renderer, $.spread_props([
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
							ChevronUp($$renderer, { class: 'size-4' });
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