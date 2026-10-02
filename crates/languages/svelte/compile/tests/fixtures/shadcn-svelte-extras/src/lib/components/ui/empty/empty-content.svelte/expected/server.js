import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Empty_content($$renderer, $$props) {
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
			'data-slot': 'empty-content',
			class: $.clsx(cn('flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}