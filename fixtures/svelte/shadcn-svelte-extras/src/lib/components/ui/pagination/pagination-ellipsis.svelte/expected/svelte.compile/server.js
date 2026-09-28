import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';

export default function Pagination_ellipsis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			'aria-hidden': 'true',
			'data-slot': 'pagination-ellipsis',
			class: $.clsx(cn("flex size-9 items-center items-center justify-center justify-center [&_svg:not([class*='size-'])]:size-4", className)),
			...restProps
		})}>`);

		MoreHorizontalIcon($$renderer, {});
		$$renderer.push(`<!----> <span class="sr-only">More pages</span></span>`);
		$.bind_props($$props, { ref });
	});
}