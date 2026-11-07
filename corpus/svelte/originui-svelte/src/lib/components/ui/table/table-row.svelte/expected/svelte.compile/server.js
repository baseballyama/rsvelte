import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tr${$.attributes({
			class: $.clsx(cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
		$.bind_props($$props, { ref });
	});
}