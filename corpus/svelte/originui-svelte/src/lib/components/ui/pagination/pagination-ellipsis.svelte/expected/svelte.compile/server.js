import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';

export default function Pagination_ellipsis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			'aria-hidden': 'true',
			class: $.clsx(cn('flex size-9 items-center justify-center', className)),
			...restProps
		})}>`);

		MoreHorizontal($$renderer, { size: 16 });
		$$renderer.push(`<!----> <span class="sr-only">More pages</span></span>`);
		$.bind_props($$props, { ref });
	});
}