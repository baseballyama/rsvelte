import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Dialog_title($$renderer, $$props) {
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
			if (DialogPrimitive.Title) {
				$$renderer.push('<!--[-->');

				DialogPrimitive.Title($$renderer, $.spread_props([
					{
						'data-slot': 'dialog-title',
						class: cn('text-lg leading-none font-semibold', className)
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