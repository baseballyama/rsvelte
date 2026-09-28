import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from 'bits-ui';
import Check from 'lucide-svelte/icons/check';
import { cn } from '$lib/utils.js';

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
					$$renderer.push(`<span class="absolute right-2 flex size-3.5 items-center justify-center">`);

					if (selected) {
						$$renderer.push('<!--[0-->');
						Check($$renderer, { class: 'size-4' });
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
							class: cn('data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50', className)
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