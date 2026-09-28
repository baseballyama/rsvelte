import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<td${$.attributes({
			class: $.clsx(cn('p-3 align-middle [&:has([role=checkbox])]:pr-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></td>`);
		$.bind_props($$props, { ref });
	});
}