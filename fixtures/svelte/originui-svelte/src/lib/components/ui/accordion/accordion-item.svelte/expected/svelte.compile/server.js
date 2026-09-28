import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Accordion as AccordionPrimitive } from 'bits-ui';

export default function Accordion_item($$renderer, $$props) {
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
			if (AccordionPrimitive.Item) {
				$$renderer.push('<!--[-->');

				AccordionPrimitive.Item($$renderer, $.spread_props([
					{
						'data-slot': 'accordion-item',
						class: cn('border-b', className)
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