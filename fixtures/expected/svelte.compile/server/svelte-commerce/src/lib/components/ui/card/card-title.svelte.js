import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Card_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			level = 3,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			role: 'heading',
			'aria-level': level,
			class: $.clsx(cn('font-semibold leading-none tracking-tight', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}