import * as $ from 'svelte/internal/server';
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			checked = false,
			indeterminate = false,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<div data-slot="checkbox-indicator" class="cn-checkbox-indicator grid place-content-center text-current transition-none">`);

					if (checked) {
						$$renderer.push('<!--[0-->');

						IconPlaceholder($$renderer, {
							lucide: 'CheckIcon',
							tabler: 'IconCheck',
							hugeicons: 'Tick02Icon',
							phosphor: 'CheckIcon',
							remixicon: 'RiCheckLine'
						});
					} else if (indeterminate) {
						$$renderer.push('<!--[1-->');

						IconPlaceholder($$renderer, {
							lucide: 'MinusIcon',
							tabler: 'IconMinus',
							hugeicons: 'MinusSignIcon',
							phosphor: 'MinusIcon',
							remixicon: 'RiSubtractLine'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				if (CheckboxPrimitive.Root) {
					$$renderer.push('<!--[-->');

					CheckboxPrimitive.Root($$renderer, $.spread_props([
						{
							'data-slot': 'checkbox',
							class: cn("cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50", className)
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