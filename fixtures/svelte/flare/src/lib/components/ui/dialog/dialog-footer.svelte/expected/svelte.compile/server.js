import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Dialog_footer($$renderer, $$props) {
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
			'data-slot': 'dialog-footer',
			class: $.clsx(cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}