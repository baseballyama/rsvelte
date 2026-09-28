import * as $ from 'svelte/internal/server';
import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
import { getToggleGroupCtx } from './toggle-group.svelte';
import { cn } from '$lib/utils.js';
import { toggleVariants } from '$lib/components/ui/toggle/index.js';

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
						class: cn('data-[state=on]:bg-muted shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t', toggleVariants({ variant: ctx.variant || variant, size: ctx.size || size }), className),
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