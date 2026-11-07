import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Tabs as TabsPrimitive } from 'bits-ui';

export default function Tabs_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			value,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (TabsPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				TabsPrimitive.Trigger($$renderer, $.spread_props([
					{
						class: cn('hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-selected:text-foreground data-[state=active]:bg-background inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap outline-hidden transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-selected:shadow-xs [&_svg]:shrink-0', className),
						value
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