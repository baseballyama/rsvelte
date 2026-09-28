import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Breadcrumb_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ol${$.attributes({
			'data-slot': 'breadcrumb-list',
			class: $.clsx(cn('text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ol>`);
		$.bind_props($$props, { ref });
	});
}