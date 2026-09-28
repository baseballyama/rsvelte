import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Tabs as TabsPrimitive } from 'bits-ui';

export default function Tabs_list($$renderer, $$props) {
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
			if (TabsPrimitive.List) {
				$$renderer.push('<!--[-->');

				TabsPrimitive.List($$renderer, $.spread_props([
					{
						class: cn('bg-muted text-muted-foreground/70 inline-flex w-fit items-center justify-center rounded-md p-0.5', className)
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