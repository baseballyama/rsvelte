import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table_caption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<caption${$.attributes({
			'data-slot': 'table-caption',
			class: $.clsx(cn("mt-4 text-sm text-muted-foreground", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></caption>`);
		$.bind_props($$props, { ref });
	});
}