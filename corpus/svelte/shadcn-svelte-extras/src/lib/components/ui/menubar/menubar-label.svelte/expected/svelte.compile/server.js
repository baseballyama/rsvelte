import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Menubar_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			inset,
			children,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'menubar-label',
			'data-inset': inset,
			class: $.clsx(cn('px-2 py-1.5 text-sm font-medium data-inset:pl-8', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}