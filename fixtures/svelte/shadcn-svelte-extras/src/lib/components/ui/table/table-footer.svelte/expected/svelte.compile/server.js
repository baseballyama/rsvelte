import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tfoot${$.attributes({
			'data-slot': 'table-footer',
			class: $.clsx(cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tfoot>`);
		$.bind_props($$props, { ref });
	});
}