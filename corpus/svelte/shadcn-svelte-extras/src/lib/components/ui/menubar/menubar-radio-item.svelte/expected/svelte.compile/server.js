import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import CheckIcon from '@lucide/svelte/icons/check';

export default function Menubar_radio_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			inset,
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
					$$renderer.push(`<span class="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&amp;_svg:not([class*='size-'])]:size-4">`);

					if (checked) {
						$$renderer.push('<!--[0-->');
						CheckIcon($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> `);
					childrenProp?.($$renderer, { checked });
					$$renderer.push(`<!---->`);
				}

				if (MenubarPrimitive.RadioItem) {
					$$renderer.push('<!--[-->');

					MenubarPrimitive.RadioItem($$renderer, $.spread_props([
						{
							'data-slot': 'menubar-radio-item',
							'data-inset': inset,
							class: cn("focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)
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