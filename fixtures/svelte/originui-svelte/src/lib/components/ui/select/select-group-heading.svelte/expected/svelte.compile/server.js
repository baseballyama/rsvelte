import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Select_group_heading($$renderer, $$props) {
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
			if (SelectPrimitive.GroupHeading) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.GroupHeading($$renderer, $.spread_props([
					{
						class: cn('text-muted-foreground py-1.5 ps-8 pe-2 text-xs font-medium', className)
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