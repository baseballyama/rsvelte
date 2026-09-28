import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

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
			class: $.clsx(cn("cn-pagination-ellipsis flex items-center justify-center", className)),
			...restProps
		})}>`);

		IconPlaceholder($$renderer, {
			lucide: 'MoreHorizontalIcon',
			tabler: 'IconDots',
			hugeicons: 'MoreHorizontalCircle01Icon',
			phosphor: 'DotsThreeIcon',
			remixicon: 'RiMoreLine'
		});

		$$renderer.push(`<!----> <span class="sr-only">More pages</span></span>`);
		$.bind_props($$props, { ref });
	});
}