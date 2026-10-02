import * as $ from 'svelte/internal/server';
import Ellipsis from "@lucide/svelte/icons/ellipsis";
import { cn } from "$lib/utils.js";

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
			role: 'presentation',
			'aria-hidden': 'true',
			class: $.clsx(cn("flex size-9 items-center justify-center", className)),
			...restProps
		})}>`);

		Ellipsis($$renderer, { class: 'size-4' });
		$$renderer.push(`<!----> <span class="sr-only">More</span></span>`);
		$.bind_props($$props, { ref });
	});
}