import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Pagination_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ul${$.attributes({
			class: $.clsx(cn('flex flex-row items-center gap-1', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
		$.bind_props($$props, { ref });
	});
}