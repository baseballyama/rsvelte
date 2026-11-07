import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

export default function Dropdown_menu_item($$renderer, $$props) {
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
			if (DropdownMenuPrimitive.Item) {
				$$renderer.push('<!--[-->');

				DropdownMenuPrimitive.Item($$renderer, $.spread_props([
					{
						class: cn('relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0', inset && 'pl-8', className)
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