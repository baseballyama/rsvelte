import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Menubar_checkbox_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			checked = false,
			indeterminate = false,
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
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<span class="cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center">`);

					if (indeterminate) {
						$$renderer.push('<!--[0-->');

						IconPlaceholder($$renderer, {
							lucide: 'MinusIcon',
							tabler: 'IconMinus',
							hugeicons: 'MinusSignIcon',
							phosphor: 'MinusIcon',
							remixicon: 'RiSubtractLine'
						});
					} else if (checked) {
						$$renderer.push('<!--[1-->');

						IconPlaceholder($$renderer, {
							lucide: 'CheckIcon',
							tabler: 'IconCheck',
							hugeicons: 'Tick02Icon',
							phosphor: 'CheckIcon',
							remixicon: 'RiCheckLine'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> `);
					childrenProp?.($$renderer);
					$$renderer.push(`<!---->`);
				}

				if (MenubarPrimitive.CheckboxItem) {
					$$renderer.push('<!--[-->');

					MenubarPrimitive.CheckboxItem($$renderer, $.spread_props([
						{
							'data-slot': 'menubar-checkbox-item',
							'data-inset': inset,
							class: cn("cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
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