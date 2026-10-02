import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Breadcrumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<nav${$.attributes({
			'data-slot': 'breadcrumb',
			'aria-label': 'breadcrumb',
			class: $.clsx(cn('cn-breadcrumb', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></nav>`);
		$.bind_props($$props, { ref });
	});
}