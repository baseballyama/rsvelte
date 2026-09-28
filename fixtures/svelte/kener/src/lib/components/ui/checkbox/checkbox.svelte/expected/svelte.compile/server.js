import * as $ from 'svelte/internal/server';
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import CheckIcon from "@lucide/svelte/icons/check";
import MinusIcon from "@lucide/svelte/icons/minus";
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
					$$renderer.push(`<div data-slot="checkbox-indicator" class="text-current transition-none">`);

					if (checked) {
						$$renderer.push('<!--[0-->');
						CheckIcon($$renderer, { class: 'size-3.5' });
					} else if (indeterminate) {
						$$renderer.push('<!--[1-->');
						MinusIcon($$renderer, { class: 'size-3.5' });
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
							class: cn("border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className)
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