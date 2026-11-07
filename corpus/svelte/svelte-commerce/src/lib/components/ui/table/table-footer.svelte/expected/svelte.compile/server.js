import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

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
			class: $.clsx(cn('bg-muted/50 font-medium', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tfoot>`);
		$.bind_props($$props, { ref });
	});
}