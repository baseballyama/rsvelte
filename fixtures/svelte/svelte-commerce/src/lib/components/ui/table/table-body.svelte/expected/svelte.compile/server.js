import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Table_body($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
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