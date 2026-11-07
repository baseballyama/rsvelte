import * as $ from 'svelte/internal/server';
import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

export default function Collapsible($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, open = false, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (CollapsiblePrimitive.Root) {
				$$renderer.push('<!--[-->');

				CollapsiblePrimitive.Root($$renderer, $.spread_props([
					{ 'data-slot': 'collapsible' },
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
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
		$.bind_props($$props, { ref, open });
	});
}