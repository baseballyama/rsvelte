import * as $ from 'svelte/internal/server';
import { getToggleGroupCtx } from '$lib/components/ui/toggle-group/toggle-group.svelte';
import { toggleVariants } from '$lib/components/ui/toggle.svelte';
import { cn } from '$lib/utils.js';
import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';

export default function Toggle_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			size,
			value,
			variant,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getToggleGroupCtx();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ToggleGroupPrimitive.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroupPrimitive.Item($$renderer, $.spread_props([
					{
						value,
						class: cn(toggleVariants({ size: ctx.size || size, variant: ctx.variant || variant }), 'min-w-0 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l', className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
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