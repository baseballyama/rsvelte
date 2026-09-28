import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import MinusIcon from '@lucide/svelte/icons/minus';

export default function Input_otp_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'input-otp-separator',
			role: 'separator',
			class: $.clsx(cn("flex items-center [&_svg:not([class*='size-'])]:size-4", className)),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			MinusIcon($$renderer, {});
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}