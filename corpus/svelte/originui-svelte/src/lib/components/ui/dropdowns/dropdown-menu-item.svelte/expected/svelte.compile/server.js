import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

export default function Dropdown_menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			inset,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenuPrimitive.Item) {
				$$renderer.push('<!--[-->');

				DropdownMenuPrimitive.Item($$renderer, $.spread_props([
					{
						class: cn('focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0', inset && 'pl-8', className)
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