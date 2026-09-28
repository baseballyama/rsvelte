import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import CheckIcon from '@lucide/svelte/icons/check';

export default function Select_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value,
			label,
			children: childrenProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { selected, highlighted }) {
					$$renderer.push(`<span class="absolute end-2 flex size-3.5 items-center justify-center">`);

					if (selected) {
						$$renderer.push('<!--[0-->');
						CheckIcon($$renderer, { class: 'cn-select-item-indicator-icon' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> `);

					if (childrenProp) {
						$$renderer.push('<!--[0-->');
						childrenProp($$renderer, { selected, highlighted });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(label || value)}`);
					}

					$$renderer.push(`<!--]-->`);
				}

				if (SelectPrimitive.Item) {
					$$renderer.push('<!--[-->');

					SelectPrimitive.Item($$renderer, $.spread_props([
						{
							value,
							'data-slot': 'select-item',
							class: cn("focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground focus:bg-accent data-highlighted:bg-accent data-highlighted:text-accent-foreground focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className)
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