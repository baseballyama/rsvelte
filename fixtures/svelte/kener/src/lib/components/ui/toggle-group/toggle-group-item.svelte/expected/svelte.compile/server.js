import * as $ from 'svelte/internal/server';
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import { getToggleGroupCtx } from "./toggle-group.svelte";
import { cn } from "$lib/utils.js";
import { toggleVariants } from "$lib/components/ui/toggle/index.js";

export default function Toggle_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			size,
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
						'data-slot': 'toggle-group-item',
						'data-variant': ctx.variant || variant,
						'data-size': ctx.size || size,
						'data-spacing': ctx.spacing,
						class: cn(toggleVariants({ variant: ctx.variant || variant, size: ctx.size || size }), "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10 data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l", className),
						value
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
		$.bind_props($$props, { ref, value });
	});
}