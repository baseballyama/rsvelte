import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import Circle from 'lucide-svelte/icons/circle';
import { cn } from '$lib/utils.ts';

export default function Dropdown_menu_radio_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children: childrenProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked }) {
					$$renderer.push(`<span class="absolute left-2 flex size-3.5 items-center justify-center">`);

					if (checked) {
						$$renderer.push('<!--[0-->');
						Circle($$renderer, { class: 'size-2 fill-current' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> `);
					childrenProp?.($$renderer, { checked });
					$$renderer.push(`<!---->`);
				}

				if (DropdownMenuPrimitive.RadioItem) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.RadioItem($$renderer, $.spread_props([
						{
							class: cn('data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50', className)
						},
						restProps,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							},
							children,
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
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