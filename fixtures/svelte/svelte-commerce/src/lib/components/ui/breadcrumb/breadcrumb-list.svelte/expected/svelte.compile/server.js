import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

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
			class: $.clsx(cn('flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ol>`);
		$.bind_props($$props, { ref });
	});
}