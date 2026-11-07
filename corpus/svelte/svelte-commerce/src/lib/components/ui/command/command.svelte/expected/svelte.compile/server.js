import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

export default function Command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = '',
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (CommandPrimitive.Root) {
				$$renderer.push('<!--[-->');

				CommandPrimitive.Root($$renderer, $.spread_props([
					{
						class: cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)
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

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
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
		$.bind_props($$props, { value, ref });
	});
}