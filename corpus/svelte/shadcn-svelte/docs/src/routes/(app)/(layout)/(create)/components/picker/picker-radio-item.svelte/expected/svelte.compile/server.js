import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Picker_radio_item($$renderer, $$props) {
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
					$$renderer.push(`<span class="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-radio-item-indicator">`);

					if (checked) {
						$$renderer.push('<!--[0-->');

						IconPlaceholder($$renderer, {
							lucide: 'CheckIcon',
							tabler: 'IconCheck',
							hugeicons: 'Tick02Icon',
							phosphor: 'CheckIcon',
							remixicon: 'RiCheckLine',
							class: 'size-4 pointer-coarse:size-5'
						});
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
							'data-slot': 'dropdown-menu-radio-item',
							class: cn("relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 data-inset:pl-8 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [[data-slot=dropdown-menu-sub-content]_&]:focus:bg-accent [[data-slot=dropdown-menu-sub-content]_&]:focus:text-accent-foreground [[data-slot=dropdown-menu-sub-content]_&]:focus:**:text-accent-foreground", className)
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