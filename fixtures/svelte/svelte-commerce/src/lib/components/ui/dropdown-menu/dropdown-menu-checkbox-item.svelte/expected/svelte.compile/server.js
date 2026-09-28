import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import { Check, Minus } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

export default function Dropdown_menu_checkbox_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children: childrenProp,
			checked = false,
			indeterminate = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<span class="absolute left-2 flex size-3.5 items-center justify-center">`);

					if (indeterminate) {
						$$renderer.push('<!--[0-->');
						Minus($$renderer, { class: 'size-3.5' });
					} else {
						$$renderer.push('<!--[-1-->');
						Check($$renderer, { class: cn('size-3.5', !checked && 'text-transparent') });
					}

					$$renderer.push(`<!--]--></span> `);
					childrenProp?.($$renderer, { checked, indeterminate });
					$$renderer.push(`<!---->`);
				}

				if (DropdownMenuPrimitive.CheckboxItem) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.CheckboxItem($$renderer, $.spread_props([
						{
							class: cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50', className)
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
		$.bind_props($$props, { ref, checked, indeterminate, class: className });
	});
}