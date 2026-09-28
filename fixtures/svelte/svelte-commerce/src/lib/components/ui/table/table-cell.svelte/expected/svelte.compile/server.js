import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Table_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<td${$.attributes({
			class: $.clsx(cn('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></td>`);
		$.bind_props($$props, { ref });
	});
}