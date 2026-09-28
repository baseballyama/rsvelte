import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Alert_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			level = 5,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'aria-level': level,
			class: $.clsx(cn('mb-1 font-medium leading-none tracking-tight', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}