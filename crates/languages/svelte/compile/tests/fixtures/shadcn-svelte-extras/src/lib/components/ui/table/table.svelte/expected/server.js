import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div data-slot="table-container" class="relative w-full overflow-x-auto"><table${$.attributes({
			'data-slot': 'table',
			class: $.clsx(cn('w-full caption-bottom text-sm', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
		$.bind_props($$props, { ref });
	});
}