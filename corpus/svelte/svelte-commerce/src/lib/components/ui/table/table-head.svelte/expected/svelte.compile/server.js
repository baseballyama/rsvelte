import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Table_head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<th${$.attributes({
			class: $.clsx(cn('h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
		$.bind_props($$props, { ref });
	});
}