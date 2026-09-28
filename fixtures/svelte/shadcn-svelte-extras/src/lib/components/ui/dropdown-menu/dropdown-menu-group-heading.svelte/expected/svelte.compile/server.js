import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Dropdown_menu_group_heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			inset,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenuPrimitive.GroupHeading) {
				$$renderer.push('<!--[-->');

				DropdownMenuPrimitive.GroupHeading($$renderer, $.spread_props([
					{
						'data-slot': 'dropdown-menu-group-heading',
						'data-inset': inset,
						class: cn('px-2 py-1.5 text-sm font-semibold data-[inset]:ps-8', className)
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