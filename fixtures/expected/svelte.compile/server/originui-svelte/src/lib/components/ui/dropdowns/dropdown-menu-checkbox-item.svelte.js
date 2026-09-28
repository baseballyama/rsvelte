import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import Minus from '@lucide/svelte/icons/minus';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

export default function Dropdown_menu_checkbox_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			checked = false,
			children: childrenProp,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">`);

					if (indeterminate) {
						$$renderer.push('<!--[0-->');
						Minus($$renderer, { class: 'size-4' });
					} else {
						$$renderer.push('<!--[-1-->');
						Check($$renderer, { class: cn('size-4', !checked && 'text-transparent') });
					}

					$$renderer.push(`<!--]--></span> `);
					childrenProp?.($$renderer);
					$$renderer.push(`<!---->`);
				}

				if (DropdownMenuPrimitive.CheckboxItem) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.CheckboxItem($$renderer, $.spread_props([
						{
							class: cn('focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none disabled:pointer-events-none disabled:opacity-50', className)
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
		$.bind_props($$props, { checked, ref });
	});
}