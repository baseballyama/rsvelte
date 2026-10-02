import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from "bits-ui";

export default function Dialog_close($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, type = "button", $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DialogPrimitive.Close) {
				$$renderer.push('<!--[-->');

				DialogPrimitive.Close($$renderer, $.spread_props([
					{ 'data-slot': 'dialog-close', type },
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