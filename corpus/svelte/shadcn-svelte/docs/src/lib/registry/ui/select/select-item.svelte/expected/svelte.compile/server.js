import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

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

						IconPlaceholder($$renderer, {
							lucide: 'CheckIcon',
							tabler: 'IconCheck',
							hugeicons: 'Tick02Icon',
							phosphor: 'CheckIcon',
							remixicon: 'RiCheckLine',
							class: 'cn-select-item-indicator-icon'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> <span class="cn-select-item-text shrink-0 whitespace-nowrap">`);

					if (childrenProp) {
						$$renderer.push('<!--[0-->');
						childrenProp($$renderer, { selected, highlighted });
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
							'data-slot': 'select-item',
							class: cn("cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
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