import * as $ from 'svelte/internal/server';
import { Ellipsis } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

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
			class: $.clsx(cn('flex size-9 items-center justify-center', className)),
			...restProps
		})}>`);

		Ellipsis($$renderer, { class: 'size-4' });
		$$renderer.push(`<!----> <span class="sr-only">More pages</span></span>`);
		$.bind_props($$props, { ref });
	});
}