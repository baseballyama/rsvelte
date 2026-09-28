import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<th${$.attributes({
			class: $.clsx(cn('text-muted-foreground h-12 px-3 text-left align-middle font-medium has-[role=checkbox]:w-px [&:has([role=checkbox])]:pr-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
		$.bind_props($$props, { ref });
	});
}