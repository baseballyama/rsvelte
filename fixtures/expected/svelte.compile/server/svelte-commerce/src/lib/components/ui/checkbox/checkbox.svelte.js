import * as $ from 'svelte/internal/server';
import { Checkbox as CheckboxPrimitive } from 'bits-ui';
import { Check, Minus } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			checked = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked }) {
					$$renderer.push(`<span class="flex size-4 items-center justify-center text-current">`);

					if (restProps.indeterminate) {
						$$renderer.push('<!--[0-->');
						Minus($$renderer, { class: 'size-3.5' });
					} else {
						$$renderer.push('<!--[-1-->');
						Check($$renderer, { class: cn('size-3.5', !checked && 'text-transparent') });
					}

					$$renderer.push(`<!--]--></span>`);
				}

				if (CheckboxPrimitive.Root) {
					$$renderer.push('<!--[-->');

					CheckboxPrimitive.Root($$renderer, $.spread_props([
						{
							class: cn('peer box-content size-4 shrink-0 rounded-sm border border-primary shadow data-[disabled=true]:cursor-not-allowed data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)
						},
						restProps,
						{
							get checked() {
								return checked;
							},

							set checked($$value) {
								checked = $$value;
								$$settled = false;
							},

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
		$.bind_props($$props, { ref, checked });
	});
}