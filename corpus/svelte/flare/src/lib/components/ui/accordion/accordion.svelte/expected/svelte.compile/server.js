import * as $ from 'svelte/internal/server';
import { Accordion as AccordionPrimitive } from 'bits-ui';

export default function Accordion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, value = void 0, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AccordionPrimitive.Root) {
				$$renderer.push('<!--[-->');

				AccordionPrimitive.Root($$renderer, $.spread_props([
					{ 'data-slot': 'accordion' },
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
		$.bind_props($$props, { ref, value });
	});
}