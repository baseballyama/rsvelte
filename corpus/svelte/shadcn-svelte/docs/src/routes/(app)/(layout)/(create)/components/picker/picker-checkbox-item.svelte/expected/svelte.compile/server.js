import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import MinusIcon from "@lucide/svelte/icons/minus";
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Picker_checkbox_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			checked = false,
			indeterminate = false,
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
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">`);

					if (indeterminate) {
						$$renderer.push('<!--[0-->');
						MinusIcon($$renderer, { class: 'size-4' });
					} else {
						$$renderer.push('<!--[-1-->');
						CheckIcon($$renderer, { class: cn("size-4", !checked && "text-transparent") });
					}

					$$renderer.push(`<!--]--></span> `);
					childrenProp?.($$renderer);
					$$renderer.push(`<!---->`);
				}

				if (DropdownMenuPrimitive.CheckboxItem) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.CheckboxItem($$renderer, $.spread_props([
						{
							'data-slot': 'dropdown-menu-checkbox-item',
							class: cn("relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent/95 focus:text-accent-foreground focus:ring-1 focus:ring-foreground/20 focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)
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

							get checked() {
								return checked;
							},

							set checked($$value) {
								checked = $$value;
								$$settled = false;
							},

							get indeterminate() {
								return indeterminate;
							},

							set indeterminate($$value) {
								indeterminate = $$value;
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
		$.bind_props($$props, { ref, checked, indeterminate });
	});
}