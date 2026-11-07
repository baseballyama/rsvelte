import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Calendar_nav($$renderer, $$props) {
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
			...restProps,
			class: $.clsx(cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1', className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></nav>`);
		$.bind_props($$props, { ref });
	});
}