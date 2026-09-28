import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';

export default function Radio_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			value = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked }) {
					if (checked) {
						$$renderer.push(`<!--[0--><div class="flex items-center justify-center text-current"><svg width="6" height="6" viewBox="0 0 6 6" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="3" r="3"></circle></svg></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				if (RadioGroupPrimitive.Item) {
					$$renderer.push('<!--[-->');

					RadioGroupPrimitive.Item($$renderer, $.spread_props([
						{
							value,
							class: cn('border-input ring-offset-background focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aspect-square size-4 rounded-full border shadow-xs shadow-black/[.04] transition-shadow focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)
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
		$.bind_props($$props, { ref, value, class: className });
	});
}