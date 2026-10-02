import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tfoot${$.attributes({
			class: $.clsx(cn('bg-muted/50 border-t font-medium last:[&>tr]:border-b-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tfoot>`);
		$.bind_props($$props, { ref });
	});
}