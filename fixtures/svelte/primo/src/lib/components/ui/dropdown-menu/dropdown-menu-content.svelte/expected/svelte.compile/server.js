import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

export default function Dropdown_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			sideOffset = 4,
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenuPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				DropdownMenuPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							if (DropdownMenuPrimitive.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenuPrimitive.Content($$renderer, $.spread_props([
									{
										sideOffset,
										class: cn('bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md', 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden', className)
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
						},
						$$slots: { default: true }
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