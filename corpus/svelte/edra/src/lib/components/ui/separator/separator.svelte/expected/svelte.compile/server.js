import * as $ from 'svelte/internal/server';
import { Separator as SeparatorPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			'data-slot': dataSlot = 'separator',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SeparatorPrimitive.Root) {
				$$renderer.push('<!--[-->');

				SeparatorPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': dataSlot,
						class: cn('shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px', 'data-[orientation=vertical]:h-full', className)
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