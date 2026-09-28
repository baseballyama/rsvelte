import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Menubar as MenubarPrimitive } from 'bits-ui';

export default function Menubar_group_heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			inset,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (MenubarPrimitive.GroupHeading) {
				$$renderer.push('<!--[-->');

				MenubarPrimitive.GroupHeading($$renderer, $.spread_props([
					{
						'data-slot': 'menubar-group-heading',
						'data-inset': inset,
						class: cn('px-2 py-1.5 text-sm font-medium data-[inset]:ps-8', className)
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