import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';

export default function Breadcrumb_ellipsis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			role: 'presentation',
			'aria-hidden': 'true',
			class: $.clsx(cn('flex size-5 items-center justify-center', className)),
			...restProps
		})}>`);

		MoreHorizontal($$renderer, { size: 16 });
		$$renderer.push(`<!----> <span class="sr-only">More</span></span>`);
		$.bind_props($$props, { ref });
	});
}