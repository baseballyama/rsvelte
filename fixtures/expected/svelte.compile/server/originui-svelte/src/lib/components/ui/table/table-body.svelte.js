import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_body($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tbody${$.attributes({
			class: $.clsx(cn('[&_tr:last-child]:border-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tbody>`);
		$.bind_props($$props, { ref });
	});
}