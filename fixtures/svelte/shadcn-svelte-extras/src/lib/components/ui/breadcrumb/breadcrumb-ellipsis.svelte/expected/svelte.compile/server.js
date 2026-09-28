import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';

export default function Breadcrumb_ellipsis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			'data-slot': 'breadcrumb-ellipsis',
			role: 'presentation',
			'aria-hidden': 'true',
			class: $.clsx(cn('flex size-5 items-center justify-center [&>svg]:size-4', className)),
			...restProps
		})}>`);

		MoreHorizontalIcon($$renderer, {});
		$$renderer.push(`<!----> <span class="sr-only">More</span></span>`);
		$.bind_props($$props, { ref });
	});
}