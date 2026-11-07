import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Select_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children: childrenProp,
			class: className,
			label,
			ref = null,
			value,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { highlighted, selected }) {
					$$renderer.push(`<span class="absolute left-2 flex size-3.5 items-center justify-center">`);

					if (selected) {
						$$renderer.push('<!--[0-->');
						Check($$renderer, { size: 16 });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> <span>`);

					if (childrenProp) {
						$$renderer.push('<!--[0-->');
						childrenProp($$renderer, { highlighted, selected });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(label || value)}`);
					}

					$$renderer.push(`<!--]--></span>`);
				}

				if (SelectPrimitive.Item) {
					$$renderer.push('<!--[-->');

					SelectPrimitive.Item($$renderer, $.spread_props([
						{
							value,
							class: cn('data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50', className)
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