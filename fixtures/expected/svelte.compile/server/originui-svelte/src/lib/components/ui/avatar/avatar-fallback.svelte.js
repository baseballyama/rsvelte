import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Avatar as AvatarPrimitive } from 'bits-ui';

export default function Avatar_fallback($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AvatarPrimitive.Fallback) {
				$$renderer.push('<!--[-->');

				AvatarPrimitive.Fallback($$renderer, $.spread_props([
					{
						class: cn('bg-secondary flex size-full items-center justify-center rounded-[inherit] text-xs', className)
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