import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Command as CommandPrimitive } from 'bits-ui';

export default function Command_empty($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (CommandPrimitive.Empty) {
			$$renderer.push('<!--[-->');

			CommandPrimitive.Empty($$renderer, $.spread_props([
				{ class: cn('py-6 text-center text-sm', className) },
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}