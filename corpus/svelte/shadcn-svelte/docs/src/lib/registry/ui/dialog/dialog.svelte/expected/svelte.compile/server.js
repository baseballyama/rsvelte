import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from "bits-ui";

export default function Dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DialogPrimitive.Root) {
				$$renderer.push('<!--[-->');

				DialogPrimitive.Root($$renderer, $.spread_props([
					restProps,
					{
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
		$.bind_props($$props, { open });
	});
}